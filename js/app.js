/* ============================================
   AI Tools Directory — App Logic
   Handles data loading, filtering, search, 
   sorting, and rendering
   ============================================ */

// --- State ---
const state = {
  tools: [],
  filteredTools: [],
  activeCategory: 'All',
  searchQuery: '',
  sortBy: 'featured',
};

// --- Constants ---
const CATEGORIES = [
  'All', 'Chatbots', 'Code', 'Image Generation',
  'Writing', 'Video', 'Audio', 'Productivity', 'Research'
];

// --- DOM Elements ---
const elements = {
  toolsGrid: () => document.getElementById('tools-grid'),
  toolsCount: () => document.getElementById('tools-count'),
  searchInput: () => document.getElementById('search-input'),
  categoriesList: () => document.getElementById('categories-list'),
  sortSelect: () => document.getElementById('sort-select'),
  newsletterForm: () => document.getElementById('newsletter-form'),
  newsletterSuccess: () => document.getElementById('newsletter-success'),
  header: () => document.querySelector('.header'),
  mobileToggle: () => document.getElementById('mobile-toggle'),
  mobileNav: () => document.getElementById('main-nav'),
  statTools: () => document.getElementById('stat-tools'),
  statCategories: () => document.getElementById('stat-categories'),
};

// --- Data Loading ---
async function loadTools() {
  try {
    const [mainRes, extRes] = await Promise.all([
      fetch('data/tools.json'),
      fetch('data/tools-extended.json').catch(() => null),
    ]);

    const mainTools = await mainRes.json();
    let extTools = [];

    if (extRes && extRes.ok) {
      extTools = await extRes.json();
    }

    state.tools = [...mainTools, ...extTools];
    state.filteredTools = [...state.tools];

    updateStats();
    renderCategories();
    applyFilters();
  } catch (error) {
    console.error('Failed to load tools:', error);
    showEmptyState('Failed to load tools. Please try again.');
  }
}

// --- Stats ---
function updateStats() {
  const statTools = elements.statTools();
  const statCategories = elements.statCategories();
  if (statTools) statTools.textContent = state.tools.length + '+';
  if (statCategories) {
    const uniqueCategories = new Set(state.tools.map(t => t.category));
    statCategories.textContent = uniqueCategories.size;
  }
}

// --- Category Rendering ---
function renderCategories() {
  const container = elements.categoriesList();
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-pill${cat === state.activeCategory ? ' active' : ''}"
            data-category="${cat}"
            id="cat-${cat.replace(/\s+/g, '-').toLowerCase()}">
      ${cat}
    </button>
  `).join('');

  container.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;

    state.activeCategory = pill.dataset.category;
    container.querySelectorAll('.category-pill').forEach(p =>
      p.classList.toggle('active', p.dataset.category === state.activeCategory)
    );
    applyFilters();
    trackEvent('category_filter', { category: state.activeCategory });
  });
}

// --- Filtering & Sorting ---
function applyFilters() {
  let results = [...state.tools];

  // Category filter
  if (state.activeCategory !== 'All') {
    results = results.filter(t => t.category === state.activeCategory);
  }

  // Search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    results = results.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query)) ||
      t.category.toLowerCase().includes(query)
    );
  }

  // Sort
  results = sortTools(results, state.sortBy);

  state.filteredTools = results;
  renderTools();
  updateToolsCount();
}

function sortTools(tools, sortBy) {
  const sorted = [...tools];
  switch (sortBy) {
    case 'featured':
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    default:
      return sorted;
  }
}

function updateToolsCount() {
  const countEl = elements.toolsCount();
  if (countEl) {
    countEl.textContent = `${state.filteredTools.length} tool${state.filteredTools.length !== 1 ? 's' : ''}`;
  }
}

// --- Card Rendering ---
function renderTools() {
  const grid = elements.toolsGrid();
  if (!grid) return;

  if (state.filteredTools.length === 0) {
    showEmptyState();
    return;
  }

  grid.innerHTML = state.filteredTools.map((tool, index) => createToolCard(tool, index)).join('');

  // Track outbound clicks without blocking navigation
  grid.addEventListener('click', (e) => {
    const cta = e.target.closest('.tool-card__cta');
    if (cta) {
      const toolId = cta.getAttribute('data-tool');
      const toolName = cta.getAttribute('data-tool-name');
      trackOutboundClick(toolId, toolName);
      // Don't preventDefault — let the <a> tag navigate naturally
    }
  });

  // Animate cards in with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '50px' });

  grid.querySelectorAll('.tool-card').forEach(card => observer.observe(card));
}

function createToolCard(tool, index) {
  const starsHtml = renderStars(tool.rating);
  const pricingClass = `badge--${tool.pricing}`;
  const pricingLabel = tool.pricing.charAt(0).toUpperCase() + tool.pricing.slice(1);

  return `
    <article class="tool-card" style="animation-delay: ${index * 0.05}s" id="tool-${tool.id}">
      <div class="tool-card__header">
        <div class="tool-card__icon" style="background: ${tool.iconBg}">
          ${tool.icon}
        </div>
        <div class="tool-card__badges">
          ${tool.featured ? '<span class="tool-card__badge badge--featured">⭐ Featured</span>' : ''}
          <span class="tool-card__badge ${pricingClass}">${pricingLabel}</span>
        </div>
      </div>
      <h3 class="tool-card__name">${tool.name}</h3>
      <span class="tool-card__category">${tool.category}</span>
      <p class="tool-card__description">${tool.description}</p>
      <div class="tool-card__tags">
        ${tool.tags.map(tag => `<span class="tool-card__tag">${tag}</span>`).join('')}
      </div>
      <div class="tool-card__footer">
        <div class="tool-card__rating">
          <span class="tool-card__rating-stars">${starsHtml}</span>
          <span>${tool.rating}</span>
        </div>
        <a href="${tool.website}" target="_blank" rel="noopener noreferrer"
           class="tool-card__cta"
           data-tool="${tool.id}"
           data-tool-name="${tool.name.replace(/"/g, '&quot;')}">
          Visit <span class="tool-card__cta-arrow">→</span>
        </a>
      </div>
    </article>
  `;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '★';
  if (hasHalf) stars += '½';
  return stars;
}

function showEmptyState(message) {
  const grid = elements.toolsGrid();
  if (!grid) return;
  grid.innerHTML = `
    <div class="tools-empty">
      <div class="tools-empty__icon">🔍</div>
      <p class="tools-empty__text">${message || 'No tools found'}</p>
      <p class="tools-empty__sub">Try adjusting your search or filters</p>
    </div>
  `;
}

// --- Event Handlers ---
function setupEventListeners() {
  // Search
  const searchInput = elements.searchInput();
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        applyFilters();
        trackEvent('search', { query: state.searchQuery });
      }, 300);
    });
  }

  // Sort
  const sortSelect = elements.sortSelect();
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFilters();
      trackEvent('sort', { sortBy: state.sortBy });
    });
  }

  // Newsletter
  const newsletterForm = elements.newsletterForm();
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // Header scroll effect
  const header = elements.header();
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Mobile menu
  const mobileToggle = elements.mobileToggle();
  const mobileNav = elements.mobileNav();
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('mobile-open');
      mobileToggle.textContent = mobileNav.classList.contains('mobile-open') ? '✕' : '☰';
    });
  }
}

// --- Newsletter ---
async function handleNewsletterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;

  if (!email) return;

  try {
    // Formspree endpoint — replace YOUR_FORM_ID with actual Formspree ID
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, _subject: 'New AI Tools Directory Subscriber' }),
    });

    const successEl = elements.newsletterSuccess();
    if (successEl) {
      successEl.classList.add('visible');
      form.reset();
      trackEvent('newsletter_signup', { email: '(redacted)' });
    }
  } catch (error) {
    // Silently handle — in production, show user-friendly error
    console.error('Newsletter error:', error);
  }
}

// --- Analytics Tracking ---
function trackEvent(eventName, params = {}) {
  // Google Analytics 4 — will work once GA is connected
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
  // Console log for development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

function trackOutboundClick(toolId, toolName) {
  trackEvent('outbound_click', {
    tool_id: toolId,
    tool_name: toolName,
    event_category: 'engagement',
  });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  loadTools();
  setupEventListeners();
});
