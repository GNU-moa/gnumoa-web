

// const toggleIcon = document.querySelector('.toglle_icon');
// const department = document.querySelector('.department');
// const departmentDetail = document.querySelector('.department_detail');

// toggleIcon.addEventListener('click', () => {
//   if (departmentDetail.style.display === 'none') {
//     departmentDetail.style.display = 'block';
//     toggleIcon.innerHTML = '<i class="fas fa-caret-up"></i>';
//     department.style.height = '400px';
//     // .department의 height 값을 'auto'로 변경하여 내용의 높이에 맞게 자동으로 조절합니다.
//   } else {
//     departmentDetail.style.display = 'none';
//     toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
//     department.style.height = '100px';
//     // .department의 height 값을 초기값인 '74px'으로 변경하여 내용이 보이지 않게 합니다.
//   }
// });

const departmentContents = document.querySelectorAll('.department_content');

departmentContents.forEach((departmentContent) => {
  const toggleIcon = departmentContent.nextElementSibling;
  const department = departmentContent.parentElement;
  const departmentDetail = department.querySelector('.department_detail');

  toggleIcon.addEventListener('click', () => {
    if (departmentDetail.style.display === 'none') {
      departmentDetail.style.display = 'block';
      toggleIcon.innerHTML = '<i class="fas fa-caret-up"></i>';
      department.style.height = 'auto';
      // .department의 height 값을 'auto'로 변경하여 내용의 높이에 맞게 자동으로 조절합니다.
    } else {
      departmentDetail.style.display = 'none';
      toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
      department.style.height = '100px';
      // .department의 height 값을 초기값인 '100px'으로 변경하여 내용이 보이지 않게 합니다.
    }
  });
});