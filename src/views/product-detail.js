/**
 * Product Detail View - Edit and save scanned product
 */

import { getProduct, updateProduct, deleteProduct } from '../lib/storage.js';

export function renderProductDetail(productId) {
  const product = getProduct(productId);
  if (!product) {
    return `
      <div class="view view-product-detail">
        <header class="view-header">
          <button class="btn-back" id="btn-back">←</button>
          <h1>Producto no encontrado</h1>
          <div class="header-spacer"></div>
        </header>
        <main class="detail-content">
          <button class="btn-primary" onclick="window.router.navigate('home')">Volver al inicio</button>
        </main>
      </div>
    `;
  }
  
  const nutrientsHtml = product.nutrients ? Object.entries(product.nutrients).map(([key, value]) => `
    <div class="nutrient-row">
      <label>${getNutrientLabel(key)}</label>
      <input type="number" step="0.1" value="${value.value || ''}" 
             data-nutrient="${key}" class="nutrient-input">
      <span class="nutrient-unit">${value.unit || ''}</span>
    </div>
  `).join('') : '<p>No hay datos nutricionales</p>';
  
  return `
    <div class="view view-product-detail">
      <header class="view-header">
        <button class="btn-back" id="btn-back">←</button>
        <h1>Editar producto</h1>
        <button class="btn-save" id="btn-save">💾</button>
      </header>
      
      <main class="detail-content">
        <section class="product-name-section">
          <label for="product-name">Nombre del producto</label>
          <input type="text" id="product-name" value="${product.name || ''}" placeholder="Ej: Chocolate sin gluten">
        </section>
        
        <section class="serving-section">
          <label for="serving-size">Porción</label>
          <input type="text" id="serving-size" value="${product.servingSize || ''}" placeholder="Ej: 30g">
        </section>
        
        <section class="nutrients-section">
          <h3>Datos nutricionales (por porción)</h3>
          ${nutrientsHtml}
        </section>
        
        ${product.ingredients ? `
          <section class="ingredients-section">
            <h3>Ingredientes</h3>
            <p class="ingredients-text">${product.ingredients}</p>
          </section>
        ` : ''}
        
        <section class="actions-section">
          <button class="btn-danger" id="btn-delete">🗑️ Eliminar producto</button>
        </section>
      </main>
    </div>
  `;
}

/**
 * Sets up event listeners for the product detail view
 */
export function setupProductDetailListeners(productId) {
  // Back button
  document.getElementById('btn-back')?.addEventListener('click', () => {
    window.router.navigate('home');
  });
  
  // Save button
  document.getElementById('btn-save')?.addEventListener('click', () => {
    const name = document.getElementById('product-name')?.value || '';
    const servingSize = document.getElementById('serving-size')?.value || '';
    
    const nutrients = {};
    document.querySelectorAll('.nutrient-input').forEach(input => {
      const nutrientKey = input.dataset.nutrient;
      const value = parseFloat(input.value) || 0;
      const unit = input.nextElementSibling?.textContent?.trim() || 'g';
      nutrients[nutrientKey] = { value, unit };
    });
    
    const product = {
      id: productId,
      name,
      servingSize,
      nutrients,
      ingredients: null,
      ocrText: null,
      scannedAt: new Date().toISOString()
    };
    
    updateProduct(product);
    alert('Producto actualizado');
    window.router.navigate('home');
  });
  
  // Delete button
  document.getElementById('btn-delete')?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
      deleteProduct(productId);
      window.router.navigate('home');
    }
  });
}

/**
 * Gets the display label for a nutrient key
 * @param {string} key - Nutrient key
 * @returns {string} Display label
 */
function getNutrientLabel(key) {
  const labels = {
    energy: 'Energía',
    fat: 'Grasas',
    saturatedFat: 'Grasas saturadas',
    carbohydrates: 'Carbohidratos',
    sugars: 'Azúcares',
    fiber: 'Fibra',
    protein: 'Proteínas',
    salt: 'Sal',
    sodium: 'Sodio'
  };
  return labels[key] || key;
}