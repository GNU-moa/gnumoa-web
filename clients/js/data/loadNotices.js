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

async function loadNotices(options) {
  const noticeCategory = options.category || category;
  let q = query(getCategoryRef(noticeCategory), orderBy("createdAt", "desc"));

  if (options.lastDoc) {
    q = query(q, startAfter(options.lastDoc), limit(10));
  } else if (options.startDoc) {
    q = query(q, endBefore(options.startDoc));
  } else {
    q = query(q, limit(10));
  }

  const querySnapshot = await getDocs(q);

  const datas = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return datas;
}

async function loadCategoriesNotices() {
  const latestPostsPromises = categories.map(async (category) => {
    options = { category };
    const datas = await loadNotices(options);
    return datas;
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

  return flattenedPosts;
}

const departmentDoc = doc(db, `${college}/${department}`);
const cacheKey = `${college}-${department}-${category || "전체"}`;
let cachedData = sessionStorage.getItem(cacheKey);
let datas = [];
let options = {};

if (category === null) {
  datas = await loadCategoriesNotices();
} else {
  if (cachedData) {
    cachedData = JSON.parse(cachedData);
    const startDocId = cachedData[0]?.id;
    if (startDocId) {
      const startDoc = await getDocObject(startDocId);
      options = { startDoc };
    }
    const newDatas = await loadNotices(options);
    datas = [...newDatas, ...cachedData];
  } else {
    datas = await loadNotices(options);
  }
}

// 데이터 그리기
datas.forEach((data) => {
  drawNotice(data);
});

// 데이터 스토리지 캐싱
if (datas.length > 0) {
  sessionStorage.setItem(cacheKey, JSON.stringify(datas));
}

function isScrollAtBottom() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  return scrollTop + clientHeight >= scrollHeight;
}

window.addEventListener("scroll", async () => {
  if (isScrollAtBottom() && !checking) {
    checking = true;
    const lastDocId = datas[datas.length - 1]["id"];
    lastDoc = await getDocObject(lastDocId);
    if (lastDoc.exists()) {
      options = { lastDoc };
      const newDatas = await loadNotices(options);
      // 데이터 그리기
      newDatas.forEach((data) => {
        drawNotice(data);
      });
      datas = [...datas, ...newDatas];
      // 데이터 스토리지 캐싱
      if (datas.length > 0) {
        sessionStorage.setItem(cacheKey, JSON.stringify(datas));
      }
    }
    checking = false;
  }
});
