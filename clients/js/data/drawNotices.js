import { Timestamp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const entire = document.querySelector(".entire");

export function drawNotice(data) {
  const noticeList = document.createElement("a");
  noticeList.classList.add("notice-list");

  // 데이터 추가
  const major = data.major;
  const category = data.category;
  const title = data.title;
  let content = data.context[0];
  // content 길이가 일정 이상이면 자르기
  if (content.length > 10) {
    content = content.substring(0, 60) + "...";
  }

  // 날짜 데이터 변환
  const timestamp = data.createdAt;
  const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  const isoString = date.toISOString().substring(0, 10);

  // 그리기
  const tagEl = document.createElement("p");
  tagEl.classList.add("notice-list-tag");
  const tagText = document.createTextNode(`${major} ${category}`);
  tagEl.appendChild(tagText);

  const titleEl = document.createElement("p");
  titleEl.classList.add("notice-list-title");
  const titleText = document.createTextNode(title);
  titleEl.appendChild(titleText);

  const contentEl = document.createElement("p");
  contentEl.classList.add("notice-list-content");
  const contentText = document.createTextNode(content);
  contentEl.appendChild(contentText);

  const dateEl = document.createElement("p");
  dateEl.classList.add("notice-list-date");
  const dateText = document.createTextNode(isoString);
  dateEl.appendChild(dateText);

  noticeList.appendChild(tagEl);
  noticeList.appendChild(titleEl);
  noticeList.appendChild(contentEl);
  noticeList.appendChild(dateEl);

  // 부모 요소에 생성한 요소 추가
  entire.appendChild(noticeList);
  if (data.baseUrl) {
    noticeList.href = data.baseUrl; // href 속성에 data.baseUrl 할당
    noticeList.target = "_blank"; // 새 창에서 열기
  }
}
