export const noticeLikeEvent = (data) => {
  const cachedData = localStorage.getItem("like-notices");
  if (cachedData) {
    const cachedDatas = JSON.parse(cachedData);
    const index = cachedDatas.findIndex(
      (cachedData) => cachedData.id === data.id
    );
    if (index !== -1) {
      cachedDatas.splice(index, 1);
    } else {
      cachedDatas.push(data);
    }
    localStorage.setItem("like-notices", JSON.stringify(cachedDatas));
  } else {
    localStorage.setItem("like-notices", JSON.stringify([data]));
  }
};
