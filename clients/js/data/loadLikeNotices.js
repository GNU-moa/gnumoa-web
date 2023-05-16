import { drawNotice } from "./drawNotices.js";

let cachedData = localStorage.getItem("like-notices");
if (cachedData) {
  let cachedDatas = JSON.parse(cachedData);
  cachedDatas.sort(
    (a, b) => new Date(b.createdAt.seconds) - new Date(a.createdAt.seconds)
  ); // 내림차순 정렬
  cachedDatas.forEach((data) => {
    drawNotice(data);
  });
}
