/**
 * Meals View - Create and view meal plans
 */

import { getAllProducts } from '../lib/storage.js';
import { createMeal, getMeals, deleteMeal, addFoodToMeal, removeFoodFromMeal } from '../lib/meal-planner.js';

export function renderMeals() {
  const meals = getMeals();
  const products = getAllProducts();
  
  const mealsHtml = meals.length === 0 ? 
    '<p class="empty-state">No hay comidas registradas. ¡Creá una!</p>' :
    meals.map(meal => {
      const totalNutrients = meal.foods.reduce((acc, food) => {
        const product = products.find(p => p.id === food.productId);
        if (product && product.nutrients) {
          for (const [key, value] of Object.entries(product.nutrients)) {
            if (!acc[key]) acc[key] = { value: 0, unit: value.unit };
            acc[key].value += value.value * (food.grams / 100);
          }
        }
        return acc;
      }, {});
      
      const totalEnergy = totalNutrients.energy?.value || 0;
      
      return `
        <div class="meal-card" data-meal-id="${meal.id}">
          <div class="meal-header">
            <h3>${meal.name}</h3>
            <span class="meal-time">${new Date(meal.date).toLocaleString('es-AR')}</span>
          </div>
          <div class="meal-nutrients">
            <span class="meal-energy">${totalEnergy.toFixed(0)} kcal</span>
          </div>
          <div class="meal-foods">
            ${meal.foods.map(food => {
              const product = products.find(p => p.id === food.productId);
              return product ? `
                <div class="meal-food-item">
                  <span>${product.name} (${food.grams}g)</span>
                  <button class="btn-remove" data-food-id="${food.id}">✕</button>
                </div>
              ` : '';
            }).join('')}
          </div>
          <button class="btn-secondary btn-add-food" data-meal-id="${meal.id}">+ Agregar alimento</button>
        </div>
      `;
    }).join('');
  
  return `
    <div class="view view-meals">
      <header class="view-header">
        <h1>Mis Comidas</h1>
        <button class="btn-primary" id="btn-new-meal">+ Nueva comida</button>
      </header>
      
      <main class="meals-content">
        <section class="meals-list">
          ${mealsHtml}
        </section>
        
        <section class="new-meal-form" id="new-meal-form" style="display: none;">
          <h3>Nueva comida</h3>
          <input type="text" id="meal-name" placeholder="Nombre (Ej: Desayuno)" class="input-text">
          <button class="btn-primary" id="btn-create-meal">Crear</button>
          <button class="btn-secondary" id="btn-cancel-meal">Cancelar</button>
        </section>
        
        <section class="add-food-form" id="add-food-form" style="display: none;">
          <h3>Agregar alimento</h3>
          <select id="food-select" class="input-select">
            <option value="">Seleccionar producto...</option>
            ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <input type="number" id="food-grams" placeholder="Gramos" class="input-text">
          <button class="btn-primary" id="btn-add-food">Agregar</button>
          <button class="btn-secondary" id="btn-cancel-food">Cancelar</button>
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
        <button class="nav-item active" data-view="meals">
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
 * Sets up event listeners for the meals view
 */
export function setupMealsListeners() {
  // New meal button
  document.getElementById('btn-new-meal')?.addEventListener('click', () => {
    document.getElementById('new-meal-form').style.display = 'block';
  });
  
  // Cancel meal
  document.getElementById('btn-cancel-meal')?.addEventListener('click', () => {
    document.getElementById('new-meal-form').style.display = 'none';
  });
  
  // Create meal
  document.getElementById('btn-create-meal')?.addEventListener('click', () => {
    const name = document.getElementById('meal-name')?.value || '';
    if (!name) {
      alert('Ingresá un nombre para la comida');
      return;
    }
    
    const meal = createMeal(name);
    document.getElementById('new-meal-form').style.display = 'none';
    document.getElementById('meal-name').value = '';
    
    // Refresh the view
    window.router.navigate('meals');
  });
  
  // Add food to meal
  document.querySelectorAll('.btn-add-food').forEach(btn => {
    btn.addEventListener('click', () => {
      const mealId = btn.dataset.mealId;
      document.getElementById('add-food-form').style.display = 'block';
      document.getElementById('add-food-form').dataset.mealId = mealId;
    });
  });
  
  // Cancel food
  document.getElementById('btn-cancel-food')?.addEventListener('click', () => {
    document.getElementById('add-food-form').style.display = 'none';
  });
  
  // Add food
  document.getElementById('btn-add-food')?.addEventListener('click', () => {
    const form = document.getElementById('add-food-form');
    const mealId = form.dataset.mealId;
    const productId = document.getElementById('food-select')?.value;
    const grams = parseFloat(document.getElementById('food-grams')?.value) || 0;
    
    if (!productId || grams <= 0) {
      alert('Seleccioná un producto e ingresá los gramos');
      return;
    }
    
    addFoodToMeal(mealId, productId, grams);
    form.style.display = 'none';
    document.getElementById('food-select').value = '';
    document.getElementById('food-grams').value = '';
    
    // Refresh the view
    window.router.navigate('meals');
  });
  
  // Remove food from meal
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const foodId = btn.dataset.foodId;
      removeFoodFromMeal(foodId);
      window.router.navigate('meals');
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