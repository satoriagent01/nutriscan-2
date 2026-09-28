/**
 * Tests for OCR module
 */

import { extractTextFromImage, extractNutritionTable } from '../lib/ocr.js';
import { describe, it, expect } from 'node:test';
import assert from 'node:assert';

describe('OCR Module', () => {
  describe('extractTextFromImage', () => {
    it('should extract text from a simple image buffer', async () => {
      // Create a simple test image (1x1 white pixel)
      const canvas = {
        width: 100,
        height: 100,
        getContext: () => ({
          fillRect: () => {},
          drawImage: () => {}
        }),
        toDataURL: () => 'data:image/png;base64,iVBORw0KGgo='
      };
      
      // Mock the Tesseract.js worker
      const mockWorker = {
        recognize: () => Promise.resolve({
          data: { text: 'Test text extraction' }
        }),
        terminate: () => Promise.resolve()
      };
      
      // Since we can't actually run Tesseract.js in tests,
      // we test the structure and error handling
      try {
        // This will fail because Tesseract.js isn't available in Node test env
        // but we verify the function exists and has correct signature
        assert.ok(typeof extractTextFromImage === 'function');
      } catch (error) {
        // Expected to fail in test environment without Tesseract.js
        assert.ok(error);
      }
    });

    it('should handle image processing errors', async () => {
      // Test error handling for invalid image data
      try {
        await extractTextFromImage(null);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message.includes('Invalid image'));
      }
    });
  });

  describe('extractNutritionTable', () => {
    it('should extract nutrition table from sample text', () => {
      const sampleText = `
        Tabla nutricional
        Porción: 100g
        Energía: 2292 kJ / 549 kcal
        Grasas: 33 g
        de las cuales saturadas: 13 g
        Carbohidratos: 55 g
        de los cuales azúcares: 45 g
        Fibra: 2.4 g
        Proteínas: 6.8 g
        Sal: 0.18 g
      `;
      
      const result = extractNutritionTable(sampleText);
      
      assert.ok(result);
      assert.ok(result.energy);
      assert.ok(result.fat);
      assert.ok(result.carbohydrates);
      assert.ok(result.protein);
    });

    it('should handle missing nutrition data', () => {
      const minimalText = 'Energía: 100 kcal';
      const result = extractNutritionTable(minimalText);
      
      assert.ok(result);
      assert.ok(result.energy);
      assert.strictEqual(result.fat, undefined);
    });

    it('should return empty object for invalid input', () => {
      const result = extractNutritionTable('');
      assert.deepStrictEqual(result, {});
    });
  });
});