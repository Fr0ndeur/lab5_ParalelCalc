// Получаем элементы
const modalOverlay = document.getElementById('modal-overlay');
const modalWindow = document.querySelector('.modal-window');
const modalCloseButton = modalOverlay.querySelector('.close-button');
const filterButtonMobile = document.querySelector('.filter-button-mobile');
const filterButton = document.querySelector('.filter-button');

// Открытие модального окна
filterButtonMobile.addEventListener('click', () => {
  modalOverlay.style.display = 'flex'; // Делаем модалку видимой
  modalWindow.style.display = 'block'; // Делаем модалку видимой
  document.body.classList.add('no-scroll'); // Отключаем прокрутку
});

// Закрытие модального окна при клике на кнопку закрытия
modalCloseButton.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
  modalWindow.style.display = 'none'; // Делаем модалку видимой
  document.body.classList.remove('no-scroll'); // Включаем прокрутку
});

// Закрытие модального окна при клике за пределами её области
window.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.style.display = 'none';
    modalWindow.style.display = 'none'; // Делаем модалку видимой
    document.body.classList.remove('no-scroll'); // Включаем прокрутку
  }
});

// Открытие модального окна
filterButton.addEventListener('click', () => {
  modalOverlay.style.display = 'flex'; // Делаем модалку видимой
  modalWindow.style.display = 'block'; // Делаем модалку видимой
  document.body.classList.add('no-scroll'); // Отключаем прокрутку
});
