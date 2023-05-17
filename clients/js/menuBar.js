//메뉴바
const menubtn = document.querySelector(".menuBar");
const menubar = document.querySelector(".menu_bars_container");
const menuclosebtn = document.querySelector(".menu_bars_close_btn");

function openMenu() {
  document.body.style.overflow = "hidden";
  menubar.classList.remove("invisible");
  menuclosebtn.addEventListener("click", closeMenu);
}

function closeMenu() {
  document.body.style.overflow = "visible";
  menubar.classList.add("invisible");
}

menubtn.addEventListener("click", openMenu);