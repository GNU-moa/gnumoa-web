let queryParams = new URLSearchParams(window.location.search);
const tagContainer = document.querySelector(".tag-container");

async function drawTag(tag) {
  const tagList = document.createElement("a");
  tagList.classList.add("tag-list");
  const tagText = document.createElement("span");
  tagText.textContent = `${tag}`;
  tagList.appendChild(tagText);
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
  queryParams = new URLSearchParams(window.location.search);
  let category = queryParams.get("category");
  if (tag === category) {
    tagList.classList.add("selected");
  } else if (tag === "전체" && !queryParams.has("category")) {
    tagList.classList.add("selected");
  }

  tagContainer.appendChild(tagList);

  tagList.href = baseUrl; // href 속성에 data.baseUrl 할당
}
