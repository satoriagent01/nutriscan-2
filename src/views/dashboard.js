/**
 * Dashboard View - Nutrition overview and stats
 */

import { getAllProducts } from '../lib/storage.js';
import { getMeals } from '../lib/meal-planner.js';

export function renderDashboard() {
  const products = getAllProducts();
  const meals = getMeals();
  
  // Calculate daily totals from all meals
  const dailyTotals = calculateDailyTotals(meals, products);
  
  // Calculate product usage stats
  const productUsage = calculateProductUsage(meals, products);
  
  // Top nutrients
  const topNutrients = getTopNutrients(dailyTotals);
  
  return `
    <div class="view view-dashboard">
      <header class="view-header">
        <h1>Resumen Nutricional</h1>
        <div class="header-spacer"></div>
      </header>
      
      <main class="dashboard-content">
        <section class="daily-summary">
          <h2>Resumen del día</h2>
          <div class="summary-grid">
            <div class="summary-card energy">
              <span class="summary-value">${dailyTotals.energy?.value?.toFixed(0) || 0}</span>
              <span class="summary-label">kcal</span>
            </div>
            <div class="summary-card fat">
              <span class="summary-value">${dailyTotals.fat?.value?.toFixed(1) || 0}</span>
              <span class="summary-label">g grasas</span>
            </div>
            <div class="summary-card carbs">
              <span class="summary-value">${dailyTotals.carbohydrates?.value?.toFixed(1) || 0}</span>
              <span class="summary-label">g carbohidratos</span>
            </div>
            <div class="summary-card protein">
              <span class="summary-value">${dailyTotals.protein?.value?.toFixed(1) || 0}</span>
              <span class="summary-label">g proteínas</span>
            </div>
          </div>
        </section>
        
        ${Object.keys(dailyTotals).length > 0 ? `
          <section class="nutrient-breakdown">
            <h2>Desglose de nutrientes</h2>
            ${Object.entries(topNutrients).map(([key, value]) => `
              <div class="nutrient-bar">
                <div class="nutrient-info">
                  <span class="nutrient-name">${getNutrientLabel(key)}</span>
                  <span class="nutrient-value">${value.value.toFixed(1)} ${value.unit}</span>
                </div>
                <div class="nutrient-progress">
                  <div class="progress-fill" style="width: ${Math.min(value.value / value.target * 100, 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        <section class="product-stats">
          <h2>Productos más usados</h2>
          ${productUsage.length === 0 ? 
            '<p class="empty-state">Escaneá productos para ver estadísticas</p>' :
            productUsage.slice(0, 5).map((item, index) => `
              <div class="product-stat-item">
                <span class="product-stat-name">${index + 1}. ${item.name}</span>
                <span class="product-stat-count">${item.count} veces</span>
              </div>
            `).join('')
          }
        </section>
        
        <section class="quick-actions">
          <h2>Acciones rápidas</h2>
          <div class="action-buttons">
            <button class="action-btn" onclick="window.router.navigate('scan')">
              <span class="action-icon">📷</span>
              <span>Escáner</span>
            </button>
            <button class="action-btn" onclick="window.router.navigate('meals')">
              <span class="action-icon">🍽️</span>
              <span>Comidas</span>
            </button>
            <button class="action-btn" onclick="window.router.navigate('history')">
              <span class="action-icon">📋</span>
              <span>Historial</span>
            </button>
          </div>
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
        <button class="nav-item" data-view="history">
          <span class="nav-icon">📋</span>
          <span>Historial</span>
        </button>
        <button class="nav-item active" data-view="dashboard">
          <span class="nav-icon">📊</span>
          <span>Resumen</span>
        </button>
      </nav>
    </div>
  `;
}

/**
 * Sets up event listeners for the dashboard view
 */
export function setupDashboardListeners() {
  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      window.router.navigate(view);
    });
  });
}

/**
 * Calculates daily totals from all meals
 * @param {Array} meals - Array of meal objects
 * @param {Array} products - Array of product objects
 * @returns {Object} Daily totals
 */
function calculateDailyTotals(meals, products) {
  const totals = {};
  
  meals.forEach(meal => {
    meal.foods.forEach(food => {
      const product = products.find(p => p.id === food.productId);
      if (product && product.nutrients) {
        for (const [key, value] of Object.entries(product.nutrients)) {
          if (!totals[key]) {
            totals[key] = { value: 0, unit: value.unit };
          }
          totals[key].value += value.value * (food.grams / 100);
        }
      }
    });
  });
  
  return totals;
}

/**
 * Calculates product usage stats
 * @param {Array} meals - Array of meal objects
 * @param {Array} products - Array of product objects
 * @returns {Array} Product usage stats
 */
function calculateProductUsage(meals, products) {
  const usage = {};
  
  meals.forEach(meal => {
    meal.foods.forEach(food => {
      if (!usage[food.productId]) {
        usage[food.productId] = { count: 0, name: '' };
      }
      usage[food.productId].count++;
      const product = products.find(p => p.id === food.productId);
      if (product) {
        usage[food.productId].name = product.name;
      }
    });
  });
  
  return Object.entries(usage)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Gets top nutrients with daily targets
 * @param {Object} dailyTotals - Daily totals
 * @returns {Object} Top nutrients
 */
function getTopNutrients(dailyTotals) {
  const targets = {
    energy: { value: 2000, unit: 'kcal', target: 2000 },
    fat: { value: 0, unit: 'g', target: 65 },
    saturatedFat: { value: 0, unit: 'g', target: 20 },
    carbohydrates: { value: 0, unit: 'g', target: 275 },
    sugars: { value: 0, unit: 'g', target: 90 },
    fiber: { value: 0, unit: 'g', target: 25 },
    protein: { value: 0, unit: 'g', target: 50 },
    salt: { value: 0, unit: 'g', target: 6 },
    sodium: { value: 0, unit: 'mg', target: 2000 }
  };
  
  const result = {};
  for (const [key, value] of Object.entries(dailyTotals)) {
    if (targets[key]) {
      result[key] = { ...value, target: targets[key].target };
    }
  }
  
  return result;
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