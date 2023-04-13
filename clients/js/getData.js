import { db, functions } from "./firebase.js";
import {
  collection,
  query,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";

const entire = document.querySelector(".entire");
const tagContainer = document.querySelector(".tag-container");

async function drawTag(tag) {
  const tagList = document.createElement("a");
  tagList.classList.add("tag-list");
  tagList.innerHTML = `
    <span>${tag}</span>
    <span> | </span>
  `;
  let baseUrl = `./department.html`;
  if (tag !== "전체") {
    if (queryParams.has("category")) {
      queryParams.set("category", tag);
      baseUrl += `?${queryParams.toString()}`;
    } else {
      baseUrl += `?${queryParams.toString()}&category=${tag}`;
    }
  } else {
    queryParams.delete("category");
    baseUrl += `?${queryParams.toString()}`;
  }

  tagContainer.appendChild(tagList);

  tagList.href = baseUrl; // href 속성에 data.baseUrl 할당
}

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

function drawNotice(data) {
  const noticeList = document.createElement("a");
  noticeList.classList.add("notice-list");

  // 데이터 추가
  const title = data.title;
  let content = data.context[0] || null;
  // content 길이가 일정 이상이면 자르기
  if (content.length > 10) {
    content = content.substring(0, 60) + "...";
  }

  // 날짜 데이터 변환
  const timestamp = data.createdAt;
  const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  const isoString = date.toISOString().substring(0, 10);

  noticeList.innerHTML = `
    <p class="notice-list-tag">${department} ${category}</p>
    <p class="notice-list-title">${title}</p>
    <p class="notice-list-content">${content}</p>
    <p class="notice-list-date">${isoString}</p>
`;

  // 부모 요소에 생성한 요소 추가
  entire.appendChild(noticeList);
  if (data.baseUrl) {
    noticeList.href = data.baseUrl; // href 속성에 data.baseUrl 할당
    noticeList.target = "_blank"; // 새 창에서 열기
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
    const latestPosts = await Promise.all(latestPostsPromises);
    const flattenedPosts = latestPosts.flat();
    flattenedPosts.sort(
      (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
    );
    const latestFivePosts = flattenedPosts.slice(0, 5);
    latestFivePosts.forEach((data) => {
      drawNotice(data);
    });
  }

  if (lastDoc) {
    q = query(
      getCategoryRef(category),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(5)
    );
  } else {
    q = query(getCategoryRef(category), orderBy("createdAt", "desc"), limit(5));
  }
  const querySnapshot = await getDocs(q);
  lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  querySnapshot.forEach((docSnap) => {
    // notice-list 클래스를 가진 div 요소 생성
    const data = docSnap.data();
    drawNotice(data);
  });
  return lastDoc;
}

function isScrollAtBottom() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  return scrollTop + clientHeight >= scrollHeight;
}

// URL 파라미터 가져오기
const queryParams = new URLSearchParams(window.location.search);
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

window.addEventListener("scroll", async () => {
  if (isScrollAtBottom() && !checking && lastDoc) {
    checking = true;
    lastDoc = await loadNotices(lastDoc);
    checking = false;
  }
});
