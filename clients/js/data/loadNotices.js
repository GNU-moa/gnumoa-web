import { db, functions } from "./firebase.js";
import { drawNotice } from "./drawNotices.js";
import {
  collection,
  query,
  doc,
  orderBy,
  limit,
  getDoc,
  getDocs,
  endBefore,
  startAfter,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";

async function getCategories() {
  const listSubcollections = httpsCallable(functions, "listSubcollections");
  return listSubcollections({ college: college, department: department })
    .then(async (result) => {
      const categories = await result.data.collections;
      return categories;
    })
    .catch((error) => {
      console.log(error);
    });
}

// 카테고리가 없으면 전체 문서를 가져오고, 있으면 카테고리 문서를 가져옴
function getCategoryRef(category) {
  if (category === null) {
    return departmentDoc;
  }
  return collection(departmentDoc, category);
}

async function loadCategoriesNotices() {
  const latestPostsPromises = categories.map(async (category) => {
    const categoryRef = getCategoryRef(category);
    const q = query(categoryRef, orderBy("createdAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
  });

  const results = await Promise.allSettled(latestPostsPromises);

  const flattenedPosts = results.reduce((acc, cur) => {
    if (cur.status === "fulfilled") {
      acc.push(...cur.value);
    }
    return acc;
  }, []);

  flattenedPosts.sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
  );

  localStorage.setItem(cacheKey, JSON.stringify(flattenedPosts));

  for (const data of flattenedPosts) {
    drawNotice(data);
  }
}

async function loadNoticesByLastDoc(lastDoc) {
  const q = lastDoc
    ? query(
        getCategoryRef(category),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(10)
      )
    : query(getCategoryRef(category), orderBy("createdAt", "desc"), limit(10));

  const querySnapshot = await getDocs(q);
  lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  const datas = querySnapshot.docs.map((doc) => doc.data());
  if (cachedData) {
    const cachedDataWithoutLast =
      typeof cachedData == "object"
        ? cachedData.slice(0, -1)
        : JSON.parse(cachedData).slice(0, -1);
    cachedData = [
      ...cachedDataWithoutLast,
      ...datas,
      lastDoc ? lastDoc.id : null,
    ];
  } else {
    cachedData = [...datas, lastDoc ? lastDoc.id : null];
  }

  localStorage.setItem(cacheKey, JSON.stringify(cachedData));

  datas.forEach((data) => {
    drawNotice(data);
  });
  return lastDoc;
}

// URL 파라미터 가져오기
const college = queryParams.get("college");
const department = queryParams.get("department");
let category = queryParams.get("category");

let lastDoc;
let checking = false; // 스크롤 이벤트 중복 방지

// 카테고리 가져오기
const categories = await getCategories();

if (categories.length > 1) {
  drawTag("전체");
  categories.forEach((tag) => {
    drawTag(tag);
  });
} else if (categories.length == 1) {
  category = categories[0];
}

async function getDocObject(docId) {
  return await getDoc(
    doc(db, `${college}/${department}/${category}`, `${docId}`)
  );
}

async function loadNotices(cachedData, startDoc, lastDoc) {
  const options = {
    collection: getCategoryRef(category),
    orderBy: ["createdAt", "desc"],
  };
  if (startDoc) {
    options.endBefore = startDoc;
  } else {
    options.limit = 10;
    if (lastDoc) {
      options.startAfter = lastDoc;
    }
  }

  const q = query(
    options.collection,
    orderBy(...options.orderBy),
    limit(options.limit),
    startAfter(options.startAfter)
  );
  const querySnapshot = await getDocs(q);
  lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  const datas = querySnapshot.docs.map((doc) => doc.data());
  return datas;
}

const departmentDoc = doc(db, `${college}/${department}`);
const cacheKey = `${college}-${department}-${category || "전체"}`;
let cachedData = localStorage.getItem(cacheKey);
let datas = [];

if (cachedData) {
  cachedData = JSON.parse(cachedData);
  //firstDoc = await getDocObject(cachedData.shift());
  lastDoc = await getDocObject(cachedData.pop());
  const newDatas = await loadNotices(cachedData, null, lastDoc);
  datas = newDatas;
  datas.forEach((data) => {
    drawNotice(data);
  });
}

function isScrollAtBottom() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  return scrollTop + clientHeight >= scrollHeight;
}

window.addEventListener("scroll", async () => {
  if (isScrollAtBottom() && !checking && lastDoc) {
    checking = true;
    const lastDoc = await getDocObject(cachedData.pop());
    datas = await loadNotices(cachedData, null, lastDoc);
    checking = false;
  }
});
