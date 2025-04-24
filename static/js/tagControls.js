let categoriesData = [];
let tagsData = [];
let albumData = [];

function updateTagCounts() {
  tagsData.forEach((tagObj) => {
    const foundPhotos = albumData.filter((photo) =>
      photo.tags.includes(tagObj.tag)
    );
    tagObj.count = foundPhotos.length;
  });
}

function renderCategories() {
  const categoriesContainer = document.querySelector('.categories-options');
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = '';

  categoriesData.forEach(({ category, active }, index) => {
    const label = document.createElement('label');
    label.classList.add('category-option');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'category';
    checkbox.value = category;
    checkbox.checked = active;

    checkbox.addEventListener('change', () => toggleCategory(index));

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(category));
    categoriesContainer.appendChild(label);
  });
}

function toggleCategory(index) {
  categoriesData[index].active = !categoriesData[index].active;
  renderCategories();

  renderTags(tagInput ? tagInput.value.toLowerCase() : '');

  renderPortfolioTags();
  renderAlbum();
}

function renderTags(searchQuery = '') {
  const activeTagsContainer = document.querySelector('.active-tags');
  const inactiveTagsContainer = document.querySelector('.inactive-tags');
  if (!activeTagsContainer || !inactiveTagsContainer) return;

  let filteredTags = tagsData;
  if (searchQuery) {
    filteredTags = tagsData.filter((t) =>
      t.tag.toLowerCase().includes(searchQuery)
    );
  }

  const activeTags = filteredTags
    .filter((t) => t.active)
    .sort((a, b) => b.count - a.count);

  const inactiveTags = filteredTags
    .filter((t) => !t.active)
    .sort((a, b) => b.count - a.count);

  activeTagsContainer.innerHTML = '';
  inactiveTagsContainer.innerHTML = '';

  const createTagElement = (obj) => {
    const { tag, count, active } = obj;
    const tagElement = document.createElement('a');
    tagElement.href = '#';
    tagElement.classList.add('tag');
    if (active) tagElement.classList.add('active');

    tagElement.innerHTML = `
      ${tag}
      ${active ? '<span class="circle"></span>' : ''}
      <div class="count"><span>${count}</span></div>
    `;

    tagElement.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTag(tag);
    });

    return tagElement;
  };

  activeTags.forEach((obj) =>
    activeTagsContainer.appendChild(createTagElement(obj))
  );
  inactiveTags.forEach((obj) =>
    inactiveTagsContainer.appendChild(createTagElement(obj))
  );

  activeTagsContainer.style.display = activeTags.length > 0 ? 'block' : 'none';
}

function renderPortfolioTags() {
  const portfolioTagsContainer = document.querySelector('.portfolio-tags');
  if (!portfolioTagsContainer) return;

  portfolioTagsContainer.innerHTML = '';

  const activeCategories = categoriesData.filter((c) => c.active);
  const activeTags = tagsData
    .filter((t) => t.active)
    .sort((a, b) => b.count - a.count);
  const inactiveTags = tagsData
    .filter((t) => !t.active)
    .sort((a, b) => b.count - a.count);

  const createCategoryElement = ({ category }) => {
    const elem = document.createElement('a');
    elem.href = '#';
    elem.classList.add('category', 'active');
    elem.innerHTML = `
        ${category}
        <span class="close-icon">✖</span>
      `;
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const i = categoriesData.findIndex((c) => c.category === category);
      if (i !== -1) toggleCategory(i);
    });
    return elem;
  };

  const createPortfolioTagElement = (obj) => {
    const { tag, active } = obj;
    const elem = document.createElement('a');
    elem.href = '#';
    elem.classList.add('tag');
    if (active) elem.classList.add('active');

    elem.innerHTML = `
        ${tag}
        ${active ? '<span class="close-icon">✖</span>' : ''}
      `;

    elem.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTag(tag);
    });
    return elem;
  };

  activeCategories.forEach((c) =>
    portfolioTagsContainer.appendChild(createCategoryElement(c))
  );
  activeTags.forEach((t) =>
    portfolioTagsContainer.appendChild(createPortfolioTagElement(t))
  );
  inactiveTags.forEach((t) =>
    portfolioTagsContainer.appendChild(createPortfolioTagElement(t))
  );
}

function toggleTag(tagName) {
  const tagObj = tagsData.find((t) => t.tag === tagName);
  if (tagObj) {
    tagObj.active = !tagObj.active;
    renderTags(tagInput ? tagInput.value.toLowerCase() : '');
    renderPortfolioTags();
    renderAlbum();
  }
}

function renderAlbum() {
  const gallery = document.getElementById('portfolio-gallery');
  if (!gallery) return;
  gallery.innerHTML = '';

  const filtered = albumData.filter(matchesFilters);

  filtered.forEach((photo) => {
    const item = document.createElement('div');
    item.classList.add('portfolio-item');

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.categories.join(', ');
    item.appendChild(img);

    const p = document.createElement('p');
    p.classList.add('photo-tag');
    p.textContent = photo.tags.join(' ');
    item.appendChild(p);

    const shareIcon = document.createElement('img');
    shareIcon.src = './share-icon.png';
    shareIcon.alt = 'Share';
    shareIcon.classList.add('share-icon');
    item.appendChild(shareIcon);

    gallery.appendChild(item);
  });
}

function matchesFilters(photo) {
  const activeCategories = categoriesData
    .filter((c) => c.active)
    .map((c) => c.category);

  const activeTags = tagsData.filter((t) => t.active).map((t) => t.tag);
  if (activeCategories.length > 0) {
    const hasAllCategories = activeCategories.every((cat) =>
      photo.categories.includes(cat)
    );
    if (!hasAllCategories) return false;
  }
  if (activeTags.length > 0) {
    const hasAllTags = activeTags.every((tag) => photo.tags.includes(tag));
    if (!hasAllTags) return false;
  }

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const loadingIcon = document.querySelector('.loading-icon');
  loadingIcon.style.display = 'block'; // Показать индикатор загрузки
  Promise.all([
    fetch('http://localhost:3000/categories').then((r) => r.json()),
    fetch('http://localhost:3000/tags').then((r) => r.json()),
    fetch('http://localhost:3000/album').then((r) => r.json()),
  ])
    .then(([categories, tags, album]) => {
      categoriesData = categories.map((cat) => ({
        category: cat.title,
        active: false,
      }));

      tagsData = tags.map((tag) => ({
        tag: tag.title,
        count: 0,
        active: false,
      }));

      if (Array.isArray(album) && Array.isArray(album[0])) {
        albumData = album[0];
      } else {
        albumData = album;
      }
      updateTagCounts();

      renderCategories();
      renderTags(tagInput ? tagInput.value.toLowerCase() : '');
      renderPortfolioTags();
      renderAlbum();
      loadingIcon.style.display = 'none'; // Скрыть индикатор при ошибке
    })
    .catch((error) => {
      console.error('Ошибка при получении данных:', error);
    });
});

const tagInput = document.querySelector('.tag-input');

if (tagInput) {
  tagInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    renderTags(query);
  });
}
