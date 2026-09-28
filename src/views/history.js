/**
 * History View - Browse previously scanned products
 */

import { getAllProducts, deleteProduct } from '../lib/storage.js';

export function renderHistory() {
  const products = getAllProducts();
  
  const productsHtml = products.length === 0 ? 
    '<p class="empty-state">No hay productos escaneados. ¡Usá el escáner!</p>' :
    products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-info">
          <h3>${product.name || 'Producto sin nombre'}</h3>
          <p class="product-brand">${product.brand || ''}</p>
          <p class="product-date">${new Date(product.scannedAt).toLocaleString('es-AR')}</p>
        </div>
        <div class="product-nutrients-preview">
          ${product.nutrients ? `
            <div class="nutrient-preview">
              <span class="nutrient-value">${product.nutrients.energy?.value?.toFixed(0) || 0}</span>
              <span class="nutrient-unit">kcal</span>
              <span class="nutrient-label">/ 100g</span>
            </div>
          ` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-secondary btn-view" data-product-id="${product.id}">Ver</button>
          <button class="btn-danger btn-delete" data-product-id="${product.id}">Eliminar</button>
        </div>
      </div>
    `).join('');
  
  return `
    <div class="view view-history">
      <header class="view-header">
        <h1>Historial</h1>
        <div class="header-spacer"></div>
      </header>
      
      <main class="history-content">
        <section class="products-list">
          ${productsHtml}
        </section>
      </main>
      
      <nav class="bottom-nav">
        <button class="nav-item" data-view="home">
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
        <button class="nav-item active" data-view="history">
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
 * Sets up event listeners for the history view
 */
export function setupHistoryListeners() {
  // View product
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      window.router.navigate('product-detail', { productId });
    });
  });
  
  // Delete product
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
        deleteProduct(productId);
        window.router.navigate('history');
      }
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