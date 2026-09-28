/**
 * Tests for nutrition parser module
 */

import { parseNutritionTable, parseNutrientValue, parseMultipleColumns } from '../lib/nutrition-parser.js';
import { describe, it, expect } from 'node:test';
import assert from 'node:assert';

describe('Nutrition Parser', () => {
  describe('parseNutrientValue', () => {
    it('should parse energy value', () => {
      const result = parseNutrientValue('2292 kJ / 549 kcal');
      assert.ok(result);
      assert.ok(result.kJ !== undefined);
      assert.ok(result.kcal !== undefined);
    });

    it('should parse simple gram value', () => {
      const result = parseNutrientValue('33 g');
      assert.strictEqual(result.value, 33);
      assert.strictEqual(result.unit, 'g');
    });

    it('should handle decimal values', () => {
      const result = parseNutrientValue('2.4 g');
      assert.strictEqual(result.value, 2.4);
      assert.strictEqual(result.unit, 'g');
    });

    it('should return null for invalid input', () => {
      const result = parseNutrientValue('');
      assert.strictEqual(result, null);
    });
  });

  describe('parseNutritionTable', () => {
    it('should parse a complete nutrition table', () => {
      const sampleText = `
        Tabla nutricional
        Por 100 g
        Energía 2292 kJ / 549 kcal
        Grasas 33 g
        de las cuales saturadas 13 g
        Carbohidratos 55 g
        de los cuales azúcares 45 g
        Fibra 2.4 g
        Proteínas 6.8 g
        Sal 0.18 g
      `;
      
      const result = parseNutritionTable(sampleText);
      
      assert.ok(result);
      assert.strictEqual(result.energy.kJ, 2292);
      assert.strictEqual(result.energy.kcal, 549);
      assert.strictEqual(result.fat, 33);
      assert.strictEqual(result.saturatedFat, 13);
      assert.strictEqual(result.carbohydrates, 55);
      assert.strictEqual(result.sugars, 45);
      assert.strictEqual(result.fiber, 2.4);
      assert.strictEqual(result.protein, 6.8);
      assert.strictEqual(result.salt, 0.18);
    });

    it('should handle missing values', () => {
      const minimalText = 'Energía 549 kcal';
      const result = parseNutritionTable(minimalText);
      
      assert.ok(result);
      assert.strictEqual(result.energy.kcal, 549);
      assert.strictEqual(result.fat, undefined);
    });

    it('should handle Dutch language', () => {
      const dutchText = `
        Voedingswaarde per 100 ml
        energie 199 kJ / 47 kcal
        vetten 0 g
        koolhydraten 11 g
        waarvan suikers 10 g
        eiwitten 0.7 g
        zout 0 g
      `;
      
      const result = parseNutritionTable(dutchText);
      
      assert.ok(result);
      assert.strictEqual(result.energy.kJ, 199);
      assert.strictEqual(result.energy.kcal, 47);
      assert.strictEqual(result.fat, 0);
      assert.strictEqual(result.carbohydrates, 11);
      assert.strictEqual(result.sugars, 10);
      assert.strictEqual(result.protein, 0.7);
      assert.strictEqual(result.salt, 0);
    });

    it('should handle German language', () => {
      const germanText = `
        Nährwertdeklaration
        Energie 2292 kJ / 549 kcal
        Fett 33 g
        Kohlenhydrate 55 g
        Eiweiß 6.8 g
        Salz 0.18 g
      `;
      
      const result = parseNutritionTable(germanText);
      
      assert.ok(result);
      assert.strictEqual(result.energy.kJ, 2292);
      assert.strictEqual(result.energy.kcal, 549);
      assert.strictEqual(result.fat, 33);
      assert.strictEqual(result.carbohydrates, 55);
      assert.strictEqual(result.protein, 6.8);
      assert.strictEqual(result.salt, 0.18);
    });

    it('should return empty object for invalid input', () => {
      const result = parseNutritionTable('');
      assert.deepStrictEqual(result, {});
    });
  });

  describe('parseMultipleColumns', () => {
    it('should parse multiple column nutrition table', () => {
      const multiColumnText = `
        Nährwertdeklaration
        100 g    30 g = 1 Melto
        Energie 2292 kJ    688 kJ
        Fett 33 g    10 g
        Kohlenhydrate 55 g    16 g
        Eiweiß 6.8 g    2.0 g
      `;
      
      const result = parseMultipleColumns(multiColumnText);
      
      assert.ok(result);
      assert.ok(result['100g']);
      assert.ok(result['30g']);
      assert.strictEqual(result['100g'].energy.kJ, 2292);
      assert.strictEqual(result['30g'].energy.kJ, 688);
    });
  });
});