// 학과 토글
const departments = document.querySelectorAll(".department");

departments.forEach((department) => {
  const departmentHeader = department.querySelector(".department_header");
  const toggleIcon = department.querySelector(".toggle_icon");
  const departmentDetail = department.querySelector(".department_detail");
  let isExpanded = false; // 초기 상태 설정

  departmentHeader.addEventListener("click", () => {
    if (!isExpanded) {
      departmentDetail.style.display = "block";
      toggleIcon.innerHTML = '<i class="fas fa-caret-up"></i>';
      isExpanded = true;
    } else {
      departmentDetail.style.display = "none";
      toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
      isExpanded = false;
    }
  });
});
