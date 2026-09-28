/**
 * Tests for storage module
 */

import { 
  saveProduct, 
  getProduct, 
  getAllProducts, 
  deleteProduct,
  saveMeal,
  getMeal,
  getAllMeals,
  deleteMeal,
  saveDailySummary,
  getDailySummary,
  getAllDailySummaries,
  deleteDailySummary
} from '../lib/storage.js';
import { describe, it, expect } from 'node:test';
import assert from 'node:assert';

describe('Storage Module', () => {
  describe('Product Storage', () => {
    it('should save a product', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        nutrition: {
          energy: { kJ: 2292, kcal: 549 },
          fat: 33,
          carbohydrates: 55,
          protein: 6.8,
          salt: 0.18
        }
      };
      
      saveProduct(product);
      const saved = getProduct(product.id);
      
      assert.ok(saved);
      assert.strictEqual(saved.name, 'Test Product');
      assert.strictEqual(saved.nutrition.energy.kJ, 2292);
    });

    it('should retrieve all products', () => {
      const products = getAllProducts();
      assert.ok(Array.isArray(products));
      assert.ok(products.length > 0);
    });

    it('should delete a product', () => {
      const product = {
        id: 'test-delete-1',
        name: 'Delete Me',
        nutrition: { energy: { kcal: 100 } }
      };
      
      saveProduct(product);
      deleteProduct(product.id);
      const deleted = getProduct(product.id);
      
      assert.strictEqual(deleted, null);
    });

    it('should return null for non-existent product', () => {
      const result = getProduct('non-existent-id');
      assert.strictEqual(result, null);
    });
  });

  describe('Meal Storage', () => {
    it('should save a meal', () => {
      const meal = {
        id: 'test-meal-1',
        name: 'Test Meal',
        date: new Date().toISOString(),
        items: [
          { productId: 'test-product-1', amount: 100 }
        ]
      };
      
      saveMeal(meal);
      const saved = getMeal(meal.id);
      
      assert.ok(saved);
      assert.strictEqual(saved.name, 'Test Meal');
      assert.strictEqual(saved.items.length, 1);
    });

    it('should retrieve all meals', () => {
      const meals = getAllMeals();
      assert.ok(Array.isArray(meals));
      assert.ok(meals.length > 0);
    });

    it('should delete a meal', () => {
      const meal = {
        id: 'test-delete-meal-1',
        name: 'Delete Meal',
        date: new Date().toISOString(),
        items: []
      };
      
      saveMeal(meal);
      deleteMeal(meal.id);
      const deleted = getMeal(meal.id);
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('Daily Summary Storage', () => {
    it('should save a daily summary', () => {
      const summary = {
        date: new Date().toISOString().split('T')[0],
        totalEnergy: 2000,
        totalFat: 80,
        totalCarbohydrates: 250,
        totalProtein: 100,
        totalSalt: 5
      };
      
      saveDailySummary(summary);
      const saved = getDailySummary(summary.date);
      
      assert.ok(saved);
      assert.strictEqual(saved.totalEnergy, 2000);
    });

    it('should retrieve all daily summaries', () => {
      const summaries = getAllDailySummaries();
      assert.ok(Array.isArray(summaries));
      assert.ok(summaries.length > 0);
    });

    it('should delete a daily summary', () => {
      const summary = {
        date: '2024-01-01',
        totalEnergy: 1500,
        totalFat: 60,
        totalCarbohydrates: 200,
        totalProtein: 80,
        totalSalt: 4
      };
      
      saveDailySummary(summary);
      deleteDailySummary(summary.date);
      const deleted = getDailySummary(summary.date);
      
      assert.strictEqual(deleted, null);
    });
  });
});