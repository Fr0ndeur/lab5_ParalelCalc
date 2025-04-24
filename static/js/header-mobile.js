document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.querySelector('.burger-menu');
  const nav = document.querySelector('.nav');
  const burgerIcon = document.querySelector('.burger-icon');
  const closeIcon = document.querySelector('.close-icon');

  burgerMenu.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');

    if (!isOpen) {
      nav.style.display = 'flex'; // Включаем отображение
      setTimeout(() => nav.classList.add('open'), 10); // Запускаем анимацию
    } else {
      nav.classList.remove('open'); // Убираем класс для анимации скрытия
      setTimeout(() => (nav.style.display = 'none'), 300); // Скрываем после завершения анимации
    }

    // Переключаем иконки
    burgerIcon.style.display = isOpen ? 'block' : 'none';
    closeIcon.style.display = isOpen ? 'none' : 'block';
  });
});
