/**
 * Home View - Main landing page with scan and history options
 */

import { getProducts } from '../lib/storage.js';

export function renderHome() {
  const products = getProducts();
  const recentProducts = products.slice(-5).reverse();
  
  return `
    <div class="view view-home">
      <header class="view-header">
        <h1>🥗 NutriScan</h1>
        <p class="subtitle">Escaneá etiquetas nutricionales</p>
      </header>
      
      <main class="home-content">
        <section class="quick-actions">
          <button class="action-card action-scan" id="btn-scan">
            <span class="action-icon">📷</span>
            <h3>Escanear producto</h3>
            <p>Tomá una foto de la tabla nutricional</p>
          </button>
          
          <button class="action-card action-meals" id="btn-meals">
            <span class="action-icon">🍽️</span>
            <h3>Mis comidas</h3>
            <p>Planificá tus comidas del día</p>
          </button>
        </section>
        
        ${recentProducts.length > 0 ? `
          <section class="recent-products">
            <h2>Últimos productos</h2>
            <div class="product-list">
              ${recentProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                  <div class="product-info">
                    <h4>${product.name || 'Producto sin nombre'}</h4>
                    <p class="product-meta">
                      ${product.nutrients?.energy?.value ? `${product.nutrients.energy.value} kcal` : ''}
                      ${product.nutrients?.protein?.value ? ` · ${product.nutrients.protein.value}g proteína` : ''}
                    </p>
                  </div>
                  <button class="btn-edit" data-id="${product.id}">✏️</button>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
        
        <section class="stats-preview">
          <h2>Tu resumen</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">${products.length}</span>
              <span class="stat-label">Productos</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">0</span>
              <span class="stat-label">Comidas hoy</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">0</span>
              <span class="stat-label">Kcal hoy</span>
            </div>
          </div>
        </section>
      </main>
      
      <nav class="bottom-nav">
        <button class="nav-item active" data-view="home">
          <span class="nav-icon">🏠</span>
          <span>Inicio</span>
        </button>
        <button class="nav-item" data-view="scan">
          <span class="nav-icon">📷</span>
          <span>Escáner</span>
        </button>
        <button class="nav-item" data-view="meals">
          <span class="nav-icon">🍽️</span>
          <span>Comidas</span>
        </button>
        <button class="nav-item" data-view="history">
          <span class="nav-icon">📋</span>
          <span>Historial</span>
        </button>
        <button class="nav-item" data-view="dashboard">
          <span class="nav-icon">📊</span>
          <span>Resumen</span>
        </button>
      </nav>
    </div>
  `;
}

/**
 * Sets up event listeners for the home view
 */
export function setupHomeListeners() {
  document.getElementById('btn-scan')?.addEventListener('click', () => {
    window.router.navigate('scan');
  });
  
  document.getElementById('btn-meals')?.addEventListener('click', () => {
    window.router.navigate('meals');
  });
  
  // Product card clicks
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-edit')) return;
      const productId = card.dataset.id;
      window.router.navigate('product-detail', { productId });
    });
  });
  
  // Edit button clicks
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.id;
      window.router.navigate('product-detail', { productId });
    });
  });
  
  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      window.router.navigate(view);
    });
  });
}