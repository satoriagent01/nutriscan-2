/**
 * Meal Planner Module
 * Manages meal planning and nutrition tracking
 */

import { getProducts, saveMeal, getMeals, deleteMeal, getUserPreferences } from './storage.js';

/**
 * Creates a new meal with products
 * @param {Object} mealData - Meal data
 * @param {string} mealData.name - Meal name
 * @param {string} mealData.date - Date of the meal
 * @param {Array} mealData.items - Array of {productId, productName, grams}
 * @returns {Object} Created meal
 */
export function createMeal(mealData) {
  const products = getProducts();
  const items = mealData.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;
    
    const grams = parseFloat(item.grams) || 0;
    const factor = grams / 100; // Normalize to per 100g
    
    return {
      productId: item.productId,
      productName: item.productName || product.name,
      grams: grams,
      nutrients: calculateNutrients(product.nutrients, factor)
    };
  }).filter(Boolean);
  
  const totalNutrients = calculateTotalNutrients(items);
  
  const meal = {
    name: mealData.name || 'Sin nombre',
    date: mealData.date || new Date().toISOString().split('T')[0],
    items: items,
    totalNutrients: totalNutrients,
    totalCalories: totalNutrients.energy?.value || 0
  };
  
  saveMeal(meal);
  return meal;
}

/**
 * Calculates nutrients for a given amount
 * @param {Object} nutrients - Base nutrients (per 100g)
 * @param {number} factor - Factor to multiply by
 * @returns {Object} Calculated nutrients
 */
function calculateNutrients(nutrients, factor) {
  if (!nutrients) return {};
  
  const calculated = {};
  for (const [key, value] of Object.entries(nutrients)) {
    if (value && value.value !== undefined) {
      calculated[key] = {
        value: value.value * factor,
        unit: value.unit
      };
    }
  }
  return calculated;
}

/**
 * Calculates total nutrients for a list of items
 * @param {Array} items - Array of meal items
 * @returns {Object} Total nutrients
 */
function calculateTotalNutrients(items) {
  const totals = {};
  
  for (const item of items) {
    if (item.nutrients) {
      for (const [key, value] of Object.entries(item.nutrients)) {
        if (value && value.value !== undefined) {
          if (!totals[key]) {
            totals[key] = { value: 0, unit: value.unit };
          }
          totals[key].value += value.value;
        }
      }
    }
  }
  
  return totals;
}

/**
 * Gets meals for a specific date
 * @param {string} date - Date to filter by (YYYY-MM-DD)
 * @returns {Array} Array of meals for the date
 */
export function getMealsByDate(date) {
  const meals = getMeals();
  return meals.filter(meal => meal.date === date);
}

/**
 * Gets all meals sorted by date (newest first)
 * @returns {Array} Sorted array of meals
 */
export function getAllMeals() {
  const meals = getMeals();
  return meals.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Gets daily nutrition summary
 * @param {string} date - Date to get summary for
 * @returns {Object} Daily summary
 */
export function getDailySummary(date) {
  const meals = getMealsByDate(date);
  const preferences = getUserPreferences();
  
  const dailyTotals = {
    energy: { value: 0, unit: 'kcal' },
    fat: { value: 0, unit: 'g' },
    saturatedFat: { value: 0, unit: 'g' },
    carbohydrates: { value: 0, unit: 'g' },
    sugars: { value: 0, unit: 'g' },
    fiber: { value: 0, unit: 'g' },
    protein: { value: 0, unit: 'g' },
    salt: { value: 0, unit: 'g' }
  };
  
  for (const meal of meals) {
    if (meal.totalNutrients) {
      for (const [key, value] of Object.entries(meal.totalNutrients)) {
        if (dailyTotals[key] && value && value.value !== undefined) {
          dailyTotals[key].value += value.value;
        }
      }
    }
  }
  
  // Calculate percentages
  const percentages = {};
  for (const [key, value] of Object.entries(dailyTotals)) {
    const target = preferences[`daily${key.charAt(0).toUpperCase() + key.slice(1)}`] || 
                   preferences[`daily${key}`];
    if (target && target > 0) {
      percentages[key] = Math.min((value.value / target) * 100, 100);
    } else {
      percentages[key] = 0;
    }
  }
  
  return {
    date: date,
    meals: meals,
    totals: dailyTotals,
    percentages: percentages,
    mealCount: meals.length
  };
}

/**
 * Gets weekly nutrition summary
 * @returns {Object} Weekly summary
 */
export function getWeeklySummary() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const meals = getMeals();
  const weeklyData = {};
  
  for (const meal of meals) {
    const mealDate = new Date(meal.date);
    if (mealDate >= weekAgo && mealDate <= today) {
      const dateKey = meal.date;
      if (!weeklyData[dateKey]) {
        weeklyData[dateKey] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0
        };
      }
      
      if (meal.totalNutrients) {
        if (meal.totalNutrients.energy) weeklyData[dateKey].calories += meal.totalNutrients.energy.value || 0;
        if (meal.totalNutrients.protein) weeklyData[dateKey].protein += meal.totalNutrients.protein.value || 0;
        if (meal.totalNutrients.carbohydrates) weeklyData[dateKey].carbs += meal.totalNutrients.carbohydrates.value || 0;
        if (meal.totalNutrients.fat) weeklyData[dateKey].fat += meal.totalNutrients.fat.value || 0;
      }
      weeklyData[dateKey].mealCount++;
    }
  }
  
  return weeklyData;
}

/**
 * Deletes a meal
 * @param {string} mealId - The meal ID to delete
 * @returns {boolean} Success status
 */
export function deleteMealById(mealId) {
  return deleteMeal(mealId);
}

/**
 * Gets nutrition trends over time
 * @param {number} days - Number of days to look back
 * @returns {Array} Array of daily summaries
 */
export function getNutritionTrends(days = 7) {
  const today = new Date();
  const trends = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const summary = getDailySummary(dateStr);
    trends.push({
      date: dateStr,
      calories: summary.totals.energy?.value || 0,
      protein: summary.totals.protein?.value || 0,
      carbs: summary.totals.carbohydrates?.value || 0,
      fat: summary.totals.fat?.value || 0,
      fiber: summary.totals.fiber?.value || 0,
      sugars: summary.totals.sugars?.value || 0,
      salt: summary.totals.salt?.value || 0
    });
  }
  
  return trends.reverse();
}