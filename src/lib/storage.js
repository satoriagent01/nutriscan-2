/**
 * Storage Module - LocalStorage wrapper for persistent data
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nutriscan_products',
  MEALS: 'nutriscan_meals',
  USER_PREFERENCES: 'nutriscan_preferences'
};

/**
 * Gets all products from storage
 * @returns {Array} Array of product objects
 */
export function getProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

/**
 * Saves a product to storage
 * @param {Object} product - The product to save
 * @returns {boolean} Success status
 */
export function saveProduct(product) {
  try {
    const products = getProducts();
    
    // Check if product already exists (by name)
    const existingIndex = products.findIndex(p => p.name === product.name);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...product, updatedAt: new Date().toISOString() };
    } else {
      products.push({ ...product, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
}

/**
 * Deletes a product from storage
 * @param {string} productId - The product ID to delete
 * @returns {boolean} Success status
 */
export function deleteProduct(productId) {
  try {
    const products = getProducts().filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

/**
 * Gets all meals from storage
 * @returns {Array} Array of meal objects
 */
export function getMeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading meals:', error);
    return [];
  }
}

/**
 * Saves a meal to storage
 * @param {Object} meal - The meal to save
 * @returns {boolean} Success status
 */
export function saveMeal(meal) {
  try {
    const meals = getMeals();
    meals.push({ ...meal, id: generateId(), createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return true;
  } catch (error) {
    console.error('Error saving meal:', error);
    return false;
  }
}

/**
 * Deletes a meal from storage
 * @param {string} mealId - The meal ID to delete
 * @returns {boolean} Success status
 */
export function deleteMeal(mealId) {
  try {
    const meals = getMeals().filter(m => m.id !== mealId);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
}

/**
 * Gets user preferences
 * @returns {Object} User preferences
 */
export function getUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : getDefaultPreferences();
  } catch (error) {
    console.error('Error reading preferences:', error);
    return getDefaultPreferences();
  }
}

/**
 * Saves user preferences
 * @param {Object} preferences - The preferences to save
 * @returns {boolean} Success status
 */
export function saveUserPreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
}

/**
 * Gets default user preferences
 * @returns {Object} Default preferences
 */
function getDefaultPreferences() {
  return {
    dailyCalories: 2000,
    dailyProtein: 50,
    dailyCarbs: 250,
    dailyFat: 65,
    dailyFiber: 25,
    dailySugar: 50,
    dailySalt: 6,
    language: 'es'
  };
}

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Clears all storage data
 * @returns {boolean} Success status
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

/**
 * Exports all data as JSON
 * @returns {string} JSON string of all data
 */
export function exportData() {
  try {
    const data = {
      products: getProducts(),
      meals: getMeals(),
      preferences: getUserPreferences(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return '';
  }
}

/**
 * Imports data from JSON string
 * @param {string} jsonData - JSON string to import
 * @returns {boolean} Success status
 */
export function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.products) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
    }
    if (data.meals) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(data.meals));
    }
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}