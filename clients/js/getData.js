import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const noticesCol = collection(db, "korea");
let lastDoc = null; // 이전 쿼리에서 마지막으로 가져온 문서

async function loadNotices(lastDoc) {
  // 최근 10개의 글만 가져옴
  let q;
  if (lastDoc) {
    q = query(
      noticesCol,
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(5)
    );
  } else {
    q = query(noticesCol, orderBy("createdAt", "desc"), limit(5));
  }
  const querySnapshot = await getDocs(q);
  lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  querySnapshot.forEach((docSnap) => {
    // notice-list 클래스를 가진 div 요소 생성
    const noticeList = document.createElement("a");
    noticeList.classList.add("notice-list");
    const data = docSnap.data();

    // 데이터 추가
    const title = data.title;
    const categoryName = data.categoryName;

    let content = data.context[0] || null;
    // content 길이가 일정 이상이면 자르기
    if (content.length > 10) {
      content = content.substring(0, 60) + "...";
    }

    // 날짜 데이터 변환
    const timestamp = data.createdAt;
    const date = new Timestamp(
      timestamp.seconds,
      timestamp.nanoseconds
    ).toDate();
    const isoString = date.toISOString().substring(0, 10);

    noticeList.innerHTML = `
    <p class="notice-list-tag">국어국문학과 ${categoryName}</p>
    <p class="notice-list-title">${title}</p>
    <p class="notice-list-content">${content}</p>
    <p class="notice-list-date">${isoString}</p>
    <p class="notice-list-like"><i class="far fa-heart"></i></p>
`;

    // 생성한 요소를 추가할 부모 요소 선택
    const entire = document.querySelector(".entire");

    // 부모 요소에 생성한 요소 추가
    entire.appendChild(noticeList);
    if (data.baseUrl) {
      noticeList.href = data.baseUrl; // href 속성에 data.baseUrl 할당
      noticeList.target = "_blank"; // 새 창에서 열기
    }
  });
  return lastDoc;
}

lastDoc = await loadNotices();
lastDoc = await loadNotices(lastDoc);
lastDoc = await loadNotices(lastDoc);
