import { db } from "./firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const docRef = doc(db, "korea", "korea_장학-등록_1");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  // notice-list 클래스를 가진 div 요소 생성
  const noticeList = document.createElement("div");
  noticeList.classList.add("notice-list");

  // 데이터 추가
  const title = docSnap.data().title;
  let content = docSnap.data().context[0] || null;
  console.log(content);
  // content 길이가 일정 이상이면 자르기
  if (content.length > 10) {
    content = content.substring(0, 60) + "...";
  }
  const date = "2021.09.01";

  noticeList.innerHTML = `
  <p class="notice-list-tag">컴퓨터과학과</p>
  <p class="notice-list-title">${title}</p>
  <p class="notice-list-content">${content}</p>
  <p class="notice-list-date">${date}</p>
  <p class="notice-list-like"><i class="far fa-heart"></i></p>
`;

  // 생성한 요소를 추가할 부모 요소 선택
  const entire = document.querySelector(".entire");

  // 부모 요소에 생성한 요소 추가
  entire.appendChild(noticeList);
} else {
  // doc.data() will be undefined in this case
  console.log("No such document!");
}
