/**
 * Nutrition Parser Module
 * Parses OCR text to extract nutrition table data
 */

/**
 * Parses nutrition table from OCR text
 * @param {string} ocrText - The text extracted from the image
 * @returns {Object} Parsed nutrition data
 */
export function parseNutritionTable(ocrText) {
  const lines = ocrText.split('\n');
  
  // Find the nutrition table section
  const tableLines = findNutritionTable(lines);
  if (!tableLines.length) {
    return { error: 'No se encontró una tabla nutricional' };
  }
  
  // Parse the table
  const parsed = parseTableData(tableLines);
  
  return {
    productName: extractProductName(ocrText),
    servingSize: extractServingSize(ocrText),
    nutrients: parsed,
    ingredients: extractIngredients(ocrText),
    rawText: ocrText
  };
}

/**
 * Finds the nutrition table section in the text
 * @param {string[]} lines - Lines of text
 * @returns {string[]} Table lines
 */
function findNutritionTable(lines) {
  const keywords = [
    'nährwert', 'nutrition', 'nutritional', 'nutrizione',
    'voedingswaarde', 'voedings', 'nährwert', 'energie',
    'fett', 'fetten', 'kohlenhydrat', 'koolhydrat',
    'zucker', 'suiker', 'eiweiß', 'eiwitten', 'salz', 'zout',
    'ballaststoff', 'vezel', 'protein', 'proteïne', 'proteínas'
  ];
  
  let startIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const keyword of keywords) {
      if (line.includes(keyword)) {
        startIndex = i;
        break;
      }
    }
    if (startIndex !== -1) break;
  }
  
  if (startIndex === -1) return [];
  
  // Find the end of the table (usually after 10-15 lines)
  let endIndex = startIndex + 15;
  for (let i = startIndex + 1; i < Math.min(startIndex + 20, lines.length); i++) {
    const line = lines[i].trim();
    if (line === '' || line.includes('ingrediente') || line.includes('ingredient')) {
      endIndex = i;
      break;
    }
  }
  
  return lines.slice(startIndex, endIndex);
}

/**
 * Parses table data into structured format
 * @param {string[]} tableLines - Lines of the nutrition table
 * @returns {Object} Parsed nutrients
 */
function parseTableData(tableLines) {
  const nutrients = {};
  
  // Common nutrient patterns
  const nutrientPatterns = [
    { key: 'energy', pattern: /energie|energía|energy/i, unit: 'kcal' },
    { key: 'fat', pattern: /fett|gras|grasses|fat|grasos/i, unit: 'g' },
    { key: 'saturatedFat', pattern: /gesättigte|saturadas|saturés|saturated|saturados/i, unit: 'g' },
    { key: 'carbohydrates', pattern: /kohlenhydrat|koolhydrat|glucides|glúcides|carbohydrat/i, unit: 'g' },
    { key: 'sugars', pattern: /zucker|suiker|sucres|sucre|sucre/i, unit: 'g' },
    { key: 'fiber', pattern: /ballaststoff|vezel|fibres|fibra|fibre/i, unit: 'g' },
    { key: 'protein', pattern: /eiweiß|eiwitten|protéine|proteínas|proteine|proteïne/i, unit: 'g' },
    { key: 'salt', pattern: /salz|zout|sel|sale/i, unit: 'g' }
  ];
  
  for (const line of tableLines) {
    for (const nutrient of nutrientPatterns) {
      if (nutrient.pattern.test(line)) {
        const value = extractValue(line);
        if (value !== null) {
          nutrients[nutrient.key] = {
            value: value,
            unit: nutrient.unit
          };
        }
        break;
      }
    }
  }
  
  return nutrients;
}

/**
 * Extracts a numeric value from a line
 * @param {string} line - The line to parse
 * @returns {number|null} The extracted value
 */
function extractValue(line) {
  // Look for patterns like "2292 kJ", "549 kcal", "33 g", "13 g"
  const valueMatch = line.match(/(\d+(?:[.,]\d+)?)/);
  if (valueMatch) {
    return parseFloat(valueMatch[1].replace(',', '.'));
  }
  return null;
}

/**
 * Extracts product name from OCR text
 * @param {string} text - The OCR text
 * @returns {string} Product name
 */
function extractProductName(text) {
  const lines = text.split('\n');
  
  // Look for common product name indicators
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    // Skip very short lines and lines that look like headers
    if (line.length > 5 && line.length < 100 && 
        !line.match(/nährwert|nutrition|nutrizione|voedings|energie|fett|zucker|eiweiß|salz|ballast/) &&
        !line.match(/^\d+$/)) {
      return line;
    }
  }
  
  return 'Producto sin nombre';
}

/**
 * Extracts serving size information
 * @param {string} text - The OCR text
 * @returns {string} Serving size
 */
function extractServingSize(text) {
  const servingPatterns = [
    /pro\s+portion|per\s+portion|por\s+porción|per\s+porzione|per\s+glas|per\s+100\s*ml|per\s+100\s*g/i,
    /(\d+\s*(?:g|ml|glasses|portions))/i
  ];
  
  for (const pattern of servingPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return '';
}

/**
 * Extracts ingredients list from OCR text
 * @param {string} text - The OCR text
 * @returns {string[]} Array of ingredients
 */
function extractIngredients(text) {
  const lines = text.split('\n');
  const ingredients = [];
  let inIngredients = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('ingrediente') || lowerLine.includes('ingredient')) {
      inIngredients = true;
      continue;
    }
    
    if (inIngredients) {
      // Stop at nutrition table or end
      if (lowerLine.includes('nährwert') || lowerLine.includes('nutrition') || 
          lowerLine.includes('energie') || lowerLine.includes('fett')) {
        break;
      }
      
      if (line.trim() && line.trim().length > 3) {
        ingredients.push(line.trim());
      }
    }
  }
  
  return ingredients;
}

/**
 * Normalizes nutrient values to per 100g/ml
 * @param {Object} nutrients - The parsed nutrients
 * @param {string} servingUnit - The serving unit (g or ml)
 * @param {number} servingSize - The serving size
 * @returns {Object} Normalized nutrients
 */
export function normalizeToPer100g(nutrients, servingUnit = 'g', servingSize = 100) {
  const normalized = {};
  
  for (const [key, value] of Object.entries(nutrients)) {
    if (value && value.value !== undefined) {
      normalized[key] = {
        value: (value.value / servingSize) * 100,
        unit: value.unit
      };
    }
  }
  
  return normalized;
}