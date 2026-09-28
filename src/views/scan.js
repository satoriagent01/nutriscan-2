/**
 * Scan View - Camera/image upload and OCR processing
 */

import { extractTextFromImage } from '../lib/ocr.js';
import { parseNutritionTable } from '../lib/nutrition-parser.js';
import { saveProduct } from '../lib/storage.js';

let currentOCRText = '';
let currentParsedData = null;

export function renderScan() {
  return `
    <div class="view view-scan">
      <header class="view-header">
        <button class="btn-back" id="btn-back-scan">←</button>
        <h1>Escáner</h1>
        <div class="header-spacer"></div>
      </header>
      
      <main class="scan-content">
        <section class="scan-upload">
          <div class="upload-area" id="upload-area">
            <div class="upload-icon">📷</div>
            <p>Tocá para tomar una foto o elegir de la galería</p>
            <input type="file" id="file-input" accept="image/*" capture="environment" hidden>
            <button class="btn-primary" id="btn-camera">Tomar foto</button>
            <button class="btn-secondary" id="btn-gallery">Elegir de galería</button>
          </div>
        </section>
        
        <section class="scan-preview" id="scan-preview" style="display: none;">
          <h3>Imagen capturada</h3>
          <img id="preview-image" src="" alt="Preview">
          <button class="btn-secondary" id="btn-retake">Rehacer foto</button>
        </section>
        
        <section class="scan-processing" id="scan-processing" style="display: none;">
          <div class="spinner"></div>
          <p>Procesando imagen con OCR...</p>
        </section>
        
        <section class="scan-results" id="scan-results" style="display: none;">
          <h3>Texto detectado</h3>
          <div class="ocr-text-box" id="ocr-text-box"></div>
          
          <h3>Datos nutricionales detectados</h3>
          <div class="nutrition-preview" id="nutrition-preview"></div>
          
          <button class="btn-primary" id="btn-save-product">Guardar producto</button>
          <button class="btn-secondary" id="btn-edit-ocr">Editar texto</button>
        </section>
      </main>
      
      <nav class="bottom-nav">
        <button class="nav-item" data-view="home">
          <span class="nav-icon">🏠</span>
          <span>Inicio</span>
        </button>
        <button class="nav-item active" data-view="scan">
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
        <button class="nav-item" data-view="dashboard">
          <span class="nav-icon">📊</span>
          <span>Resumen</span>
        </button>
      </nav>
    </div>
  `;
}

/**
 * Sets up event listeners for the scan view
 */
export function setupScanListeners() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const previewSection = document.getElementById('scan-preview');
  const previewImage = document.getElementById('preview-image');
  const processingSection = document.getElementById('scan-processing');
  const resultsSection = document.getElementById('scan-results');
  const ocrTextBox = document.getElementById('ocr-text-box');
  const nutritionPreview = document.getElementById('nutrition-preview');
  
  // Back button
  document.getElementById('btn-back-scan')?.addEventListener('click', () => {
    window.router.navigate('home');
  });
  
  // Camera button
  document.getElementById('btn-camera')?.addEventListener('click', () => {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
  });
  
  // Gallery button
  document.getElementById('btn-gallery')?.addEventListener('click', () => {
    fileInput.removeAttribute('capture');
    fileInput.click();
  });
  
  // File input change
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;
      previewImage.src = imageData;
      uploadArea.style.display = 'none';
      previewSection.style.display = 'block';
      
      // Process with OCR
      processingSection.style.display = 'block';
      resultsSection.style.display = 'none';
      
      try {
        currentOCRText = await extractTextFromImage(imageData);
        currentParsedData = parseNutritionTable(currentOCRText);
        
        ocrTextBox.textContent = currentOCRText;
        renderNutritionPreview(currentParsedData);
        
        processingSection.style.display = 'none';
        resultsSection.style.display = 'block';
      } catch (error) {
        processingSection.style.display = 'none';
        ocrTextBox.textContent = 'Error al procesar la imagen: ' + error.message;
        resultsSection.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  });
  
  // Retake button
  document.getElementById('btn-retake')?.addEventListener('click', () => {
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    currentOCRText = '';
    currentParsedData = null;
  });
  
  // Save product button
  document.getElementById('btn-save-product')?.addEventListener('click', () => {
    if (!currentParsedData) return;
    
    const product = {
      id: Date.now().toString(),
      name: currentParsedData.productName || 'Producto escaneado',
      nutrients: currentParsedData.nutrients,
      ingredients: currentParsedData.ingredients,
      servingSize: currentParsedData.servingSize,
      ocrText: currentOCRText,
      scannedAt: new Date().toISOString()
    };
    
    saveProduct(product);
    alert('Producto guardado correctamente');
    window.router.navigate('home');
  });
  
  // Edit OCR text button
  document.getElementById('btn-edit-ocr')?.addEventListener('click', () => {
    const editable = document.createElement('textarea');
    editable.value = currentOCRText;
    editable.style.width = '100%';
    editable.style.minHeight = '200px';
    editable.style.fontFamily = 'monospace';
    editable.style.fontSize = '12px';
    
    ocrTextBox.innerHTML = '';
    ocrTextBox.appendChild(editable);
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary';
    saveBtn.textContent = 'Guardar texto editado';
    saveBtn.style.marginTop = '10px';
    
    saveBtn.addEventListener('click', () => {
      currentOCRText = editable.value;
      currentParsedData = parseNutritionTable(currentOCRText);
      renderNutritionPreview(currentParsedData);
      ocrTextBox.textContent = currentOCRText;
      ocrTextBox.appendChild(saveBtn);
    });
    
    ocrTextBox.appendChild(saveBtn);
  });
  
  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      window.router.navigate(view);
    });
  });
}

/**
 * Renders the nutrition preview from parsed data
 * @param {Object} parsedData - Parsed nutrition data
 */
function renderNutritionPreview(parsedData) {
  if (!parsedData || !parsedData.nutrients) {
    nutritionPreview.innerHTML = '<p>No se detectaron datos nutricionales</p>';
    return;
  }
  
  let html = '<div class="nutrient-cards">';
  
  const nutrientLabels = {
    energy: '🔥 Energía',
    fat: '🥑 Grasas',
    saturatedFat: '🟤 Grasas sat.',
    carbohydrates: '🍞 Carbohidratos',
    sugars: '🍬 Azúcares',
    fiber: '🌾 Fibra',
    protein: '🥩 Proteínas',
    salt: '🧂 Sal'
  };
  
  for (const [key, value] of Object.entries(parsedData.nutrients)) {
    if (value && value.value !== undefined) {
      const label = nutrientLabels[key] || key;
      html += `
        <div class="nutrient-card">
          <span class="nutrient-label">${label}</span>
          <span class="nutrient-value">${value.value} ${value.unit}</span>
        </div>
      `;
    }
  }
  
  html += '</div>';
  nutritionPreview.innerHTML = html;
}