// // 학과 토글
// const departments = document.querySelectorAll(".department");

// departments.forEach((department) => {
//   const departmentHeader = department.querySelector(".department_header");
//   const college = department.querySelector(".department_content").innerHTML;
//   const toggleIcon = department.querySelector(".toggle_icon");
//   const departmentDetail = department.querySelector(".department_detail");
//   const departmentNames = departmentDetail.getElementsByTagName("a");
//   for (let i = 0; i < departmentNames.length; i++) {
//     const departmentName = departmentNames[i].innerHTML;
//     departmentNames[i].href = `./department.html?college=${college}&department=${departmentName}`;
//   }

//   let isExpanded = false; // 초기 상태 설정

//   departmentHeader.addEventListener("click", () => {
//     if (!isExpanded) {
//       departmentDetail.style.display = "block";
//       toggleIcon.innerHTML = '<i class="fas fa-caret-up"></i>';
//       isExpanded = true;
//     } else {
//       departmentDetail.style.display = "none";
//       toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
//       isExpanded = false;
//     }
//   });
// });

const departmentContents = document.querySelectorAll('.department_content');

departmentContents.forEach((departmentContent) => {
  const toggleIcon = departmentContent.nextElementSibling;
  const department = departmentContent.parentElement;
  const departmentDetail = department.querySelector('.department_detail');
  let isExpanded = false; // 초기 상태 설정

  toggleIcon.addEventListener('click', () => {
    if (!isExpanded) {
      departmentDetail.style.display = 'block';
      toggleIcon.innerHTML = '<i class="fas fa-caret-up"></i>';
      department.style.height = 'auto';
      isExpanded = true;
    } else {
      departmentDetail.style.display = 'none';
      toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
      department.style.height = '50px';
      isExpanded = false;
    }
  });
});
