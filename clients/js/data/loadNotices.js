import { db, functions } from "./firebase.js";
import { drawNotice } from "./drawNotices.js";
import {
  collection,
  query,
  doc,
  orderBy,
  limit,
  getDocs,
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

// 캐시 메모리에 있는 데이터 불러오기
async function loadCachedNotices() {
  if (cachedData) {
    const datas = JSON.parse(cachedData);
    const lastDoc = datas.pop();
    datas.forEach((data) => {
      drawNotice(data);
    });
    return lastDoc;
  } else {
    lastDoc = await loadNotices();
    return lastDoc;
  }
}

async function loadNotices(lastDoc) {
  let q;
  if (category == null) {
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

    sessionStorage.setItem(cacheKey, JSON.stringify(flattenedPosts));

    for (const data of flattenedPosts) {
      drawNotice(data);
    }
  } else {
    q = lastDoc
      ? query(
          getCategoryRef(category),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(5)
        )
      : query(getCategoryRef(category), orderBy("createdAt", "desc"), limit(5));

    const querySnapshot = await getDocs(q);
    lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    const datas = querySnapshot.docs.map((doc) => doc.data());
    if (cachedData) {
      const cachedDataWithoutLast =
        typeof cachedData == "object"
          ? cachedData.slice(0, -1)
          : JSON.parse(cachedData).slice(0, -1);
      cachedData = [...cachedDataWithoutLast, ...datas, lastDoc];
    } else {
      cachedData = [...datas, lastDoc];
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));

    datas.forEach((data) => {
      drawNotice(data);
    });
  }
  return lastDoc;
}

// URL 파라미터 가져오기
const college = queryParams.get("college");
const department = queryParams.get("department");
let category = queryParams.get("category");

let lastDoc = null; // 이전 쿼리에서 마지막으로 가져온 문서
let checking = false; // 스크롤 이벤트 중복 방지

const departmentDoc = doc(db, `${college}/${department}`);
const cacheKey = `${college}-${department}-${category || "전체"}`;

// 카테고리 가져오기
const categories = await getCategories();

if (categories.length > 1) {
  drawTag("전체");
}
categories.forEach((tag) => {
  drawTag(tag);
});

let cachedData = sessionStorage.getItem(cacheKey);
lastDoc = await loadCachedNotices(cacheKey);

function isScrollAtBottom() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  return scrollTop + clientHeight >= scrollHeight;
}

window.addEventListener("scroll", async () => {
  if (isScrollAtBottom() && !checking && lastDoc) {
    checking = true;
    lastDoc = await loadNotices(lastDoc);
    checking = false;
  }
});
