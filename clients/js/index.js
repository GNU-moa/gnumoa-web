

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
      // .department의 height 값을 'auto'로 변경하여 내용의 높이에 맞게 자동으로 조절
    } else {
      departmentDetail.style.display = 'none';
      toggleIcon.innerHTML = '<i class="fas fa-caret-down"></i>';
      department.style.height = '50px';
      // .department의 height 값을 초기값인 '100px'으로 변경
    }
  });
});
