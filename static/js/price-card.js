const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach((card) => {
  const header = card.querySelector('.service-header');
  const toggleButton = card.querySelector('.toggle-button');

  header.addEventListener('click', () => {
    console.log('kekw');
    // Закрыть все карточки
    serviceCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.remove('expanded');
        otherCard.querySelector('.toggle-button').textContent = '+';
      }
    });

    // Переключить состояние текущей карточки
    card.classList.toggle('expanded');
    toggleButton.textContent = card.classList.contains('expanded') ? '-' : '+';
  });
});
