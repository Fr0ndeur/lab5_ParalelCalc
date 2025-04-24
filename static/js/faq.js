document.querySelectorAll('.faq-item').forEach((item) => {
  console.log('Kekw');
  item.addEventListener('click', (event) => {
    const faqItem = event.target.closest('.faq-item'); // Находим ближайший контейнер faq-item
    faqItem.classList.toggle('active');

    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== faqItem) {
        item.classList.remove('active');
      }
    });
  });
});
