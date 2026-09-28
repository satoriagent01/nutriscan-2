/**
 * Tests for meal planner module
 */

import { 
  createMeal, 
  addFoodToMeal, 
  getMeal, 
  getAllMeals, 
  deleteMeal,
  calculateMealNutrition,
  calculateDailySummary,
  getDailySummary
} from '../lib/meal-planner.js';
import { describe, it, expect } from 'node:test';
import assert from 'node:assert';

describe('Meal Planner', () => {
  describe('createMeal', () => {
    it('should create a new meal', () => {
      const meal = createMeal('Breakfast', new Date().toISOString());
      
      assert.ok(meal);
      assert.strictEqual(meal.name, 'Breakfast');
      assert.ok(meal.items);
      assert.strictEqual(meal.items.length, 0);
    });

    it('should generate a unique ID', () => {
      const meal1 = createMeal('Meal 1');
      const meal2 = createMeal('Meal 2');
      
      assert.notStrictEqual(meal1.id, meal2.id);
    });
  });

  describe('addFoodToMeal', () => {
    it('should add food to a meal', () => {
      const meal = createMeal('Lunch');
      addFoodToMeal(meal.id, 'test-product-1', 100);
      
      const updatedMeal = getMeal(meal.id);
      assert.strictEqual(updatedMeal.items.length, 1);
      assert.strictEqual(updatedMeal.items[0].productId, 'test-product-1');
      assert.strictEqual(updatedMeal.items[0].amount, 100);
    });

    it('should update amount if food already exists', () => {
      const meal = createMeal('Dinner');
      addFoodToMeal(meal.id, 'test-product-2', 50);
      addFoodToMeal(meal.id, 'test-product-2', 50);
      
      const updatedMeal = getMeal(meal.id);
      assert.strictEqual(updatedMeal.items.length, 1);
      assert.strictEqual(updatedMeal.items[0].amount, 100);
    });
  });

  describe('calculateMealNutrition', () => {
    it('should calculate total nutrition for a meal', () => {
      const meal = createMeal('Test Meal');
      addFoodToMeal(meal.id, 'test-product-1', 100);
      
      // Mock the product data
      const products = {
        'test-product-1': {
          nutrition: {
            energy: { kJ: 2292, kcal: 549 },
            fat: 33,
            carbohydrates: 55,
            protein: 6.8,
            salt: 0.18
          }
        }
      };
      
      const nutrition = calculateMealNutrition(meal, products);
      
      assert.ok(nutrition);
      assert.strictEqual(nutrition.energy.kcal, 549);
      assert.strictEqual(nutrition.fat, 33);
      assert.strictEqual(nutrition.carbohydrates, 55);
      assert.strictEqual(nutrition.protein, 6.8);
      assert.strictEqual(nutrition.salt, 0.18);
    });

    it('should handle multiple food items', () => {
      const meal = createMeal('Multi Item Meal');
      addFoodToMeal(meal.id, 'product-1', 100);
      addFoodToMeal(meal.id, 'product-2', 200);
      
      const products = {
        'product-1': {
          nutrition: {
            energy: { kcal: 100 },
            fat: 5,
            carbohydrates: 10,
            protein: 2,
            salt: 0.5
          }
        },
        'product-2': {
          nutrition: {
            energy: { kcal: 200 },
            fat: 10,
            carbohydrates: 20,
            protein: 4,
            salt: 1
          }
        }
      };
      
      const nutrition = calculateMealNutrition(meal, products);
      
      assert.strictEqual(nutrition.energy.kcal, 300);
      assert.strictEqual(nutrition.fat, 15);
      assert.strictEqual(nutrition.carbohydrates, 30);
      assert.strictEqual(nutrition.protein, 6);
      assert.strictEqual(nutrition.salt, 1.5);
    });

    it('should handle missing product data', () => {
      const meal = createMeal('Missing Product Meal');
      addFoodToMeal(meal.id, 'missing-product', 100);
      
      const products = {};
      
      const nutrition = calculateMealNutrition(meal, products);
      
      assert.ok(nutrition);
      assert.strictEqual(nutrition.energy.kcal, 0);
      assert.strictEqual(nutrition.fat, 0);
    });
  });

  describe('calculateDailySummary', () => {
    it('should calculate daily summary from meals', () => {
      const meals = [
        {
          id: 'meal-1',
          items: [
            { productId: 'product-1', amount: 100 }
          ]
        },
        {
          id: 'meal-2',
          items: [
            { productId: 'product-2', amount: 200 }
          ]
        }
      ];
      
      const products = {
        'product-1': {
          nutrition: {
            energy: { kcal: 100 },
            fat: 5,
            carbohydrates: 10,
            protein: 2,
            salt: 0.5
          }
        },
        'product-2': {
          nutrition: {
            energy: { kcal: 200 },
            fat: 10,
            carbohydrates: 20,
            protein: 4,
            salt: 1
          }
        }
      };
      
      const summary = calculateDailySummary(meals, products);
      
      assert.ok(summary);
      assert.strictEqual(summary.totalEnergy, 300);
      assert.strictEqual(summary.totalFat, 15);
      assert.strictEqual(summary.totalCarbohydrates, 30);
      assert.strictEqual(summary.totalProtein, 6);
      assert.strictEqual(summary.totalSalt, 1.5);
    });

    it('should handle empty meals array', () => {
      const summary = calculateDailySummary([], {});
      
      assert.ok(summary);
      assert.strictEqual(summary.totalEnergy, 0);
      assert.strictEqual(summary.totalFat, 0);
    });
  });

  describe('getDailySummary', () => {
    it('should get daily summary for a specific date', () => {
      const today = new Date().toISOString().split('T')[0];
      const summary = getDailySummary(today);
      
      assert.ok(summary);
      assert.strictEqual(summary.date, today);
    });

    it('should return null for non-existent date', () => {
      const summary = getDailySummary('2020-01-01');
      assert.strictEqual(summary, null);
    });
  });
});