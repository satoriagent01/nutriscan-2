import { initHome } from './views/home.js';
import { initScan } from './views/scan.js';
import { initMeals } from './views/meals.js';
import { initDashboard } from './views/dashboard.js';
import { initHistory } from './views/history.js';
import { initProductDetail } from './views/product-detail.js';
import { getProducts, getMeals, getGoals } from './lib/storage.js';

const app = document.getElementById('app');
const navBtns = document.querySelectorAll('.nav-btn');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.querySelector('.close');

let currentView = 'home';

// Navigation
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    navigateTo(view);
  });
});

function navigateTo(view) {
  currentView = view;
  navBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  switch(view) {
    case 'home': initHome(); break;
    case 'scan': initScan(); break;
    case 'meals': initMeals(); break;
    case 'dashboard': initDashboard(); break;
    case 'history': initHistory(); break;
  }
}

// Modal functions
window.openModal = function(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.remove('hidden');
};

window.closeModal = function() {
  modal.classList.add('hidden');
};

closeBtn.addEventListener('click', window.closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) window.closeModal();
});

// Loading overlay
window.showLoading = function(text = 'Procesando...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading').classList.remove('hidden');
};

window.hideLoading = function() {
  document.getElementById('loading').classList.add('hidden');
};

// Initialize
initHome();

// Export for testing
export { navigateTo, getProducts, getMeals, getGoals };