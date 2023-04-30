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

async function loadNotices(lastDoc) {
  let q;
  const cacheKey = `${college}-${department}-${category || "전체"}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (category == null && cachedData) {
    const datas = JSON.parse(cachedData);
    datas.forEach((data) => {
      drawNotice(data);
    });
    console.log("cached data loaded");
    return null;
  }

  let newDatas;
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

    newDatas = flattenedPosts;
  } else {
    if (cachedData) {
      newDatas = JSON.parse(cachedData);
      newDatas.forEach((data) => {
        drawNotice(data);
      });
      console.log("cached data loaded");
    }
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
    newDatas = cachedData ? newDatas.concat(datas) : datas;

    sessionStorage.setItem(cacheKey, JSON.stringify(newDatas));

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

// 카테고리 가져오기
const categories = await getCategories();

if (categories.length > 1) {
  drawTag("전체");
}
categories.forEach((tag) => {
  drawTag(tag);
});

lastDoc = await loadNotices();
sessionStorage.setItem("lastDoc", JSON.stringify(lastDoc));

function isScrollAtBottom() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  return scrollTop + clientHeight >= scrollHeight;
}

window.addEventListener("scroll", async () => {
  if (isScrollAtBottom() && !checking && lastDoc) {
    checking = true;
    lastDoc = sessionStorage.getItem("lastDoc");
    lastDoc = await loadNotices(lastDoc);
    sessionStorage.setItem("lastDoc", JSON.stringify(lastDoc));
    checking = false;
  }
});
