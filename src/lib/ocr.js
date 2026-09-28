/**
 * OCR Module - Extracts text from images using Tesseract.js
 */

/**
 * Extracts text from an image file using Tesseract.js
 * @param {File|Blob} imageFile - The image file to process
 * @param {Object} options - Tesseract options
 * @param {string} options.lang - Language code (default: 'spa+eng')
 * @returns {Promise<string>} The extracted text
 */
export async function extractText(imageFile, options = {}) {
  const { lang = 'spa+eng' } = options;
  
  try {
    // Dynamically import Tesseract.js
    const Tesseract = await import('tesseract.js');
    
    const worker = await Tesseract.createWorker(lang);
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Error al procesar la imagen. Intenta de nuevo.');
  }
}

/**
 * Preprocesses an image for better OCR results
 * @param {File|Blob} imageFile - The image file
 * @returns {Promise<Blob>} Preprocessed image
 */
export async function preprocessImage(imageFile) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Resize for better performance
      const maxSize = 2000;
      let width = img.width;
      let height = img.height;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and enhance
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to grayscale and increase contrast
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Increase contrast
        const contrast = 1.5;
        const adjusted = ((avg - 128) * contrast) + 128;
        const clamped = Math.max(0, Math.min(255, adjusted));
        
        data[i] = clamped;     // R
        data[i + 1] = clamped; // G
        data[i + 2] = clamped; // B
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob(resolve, 'image/png');
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageFile); // Return original on error
    };
    
    img.src = url;
  });
}

/**
 * Extracts text from an image URL
 * @param {string} imageUrl - URL of the image
 * @param {Object} options - Tesseract options
 * @returns {Promise<string>} The extracted text
 */
export async function extractTextFromUrl(imageUrl, options = {}) {
  try {
    const Tesseract = await import('tesseract.js');
    
    const worker = await Tesseract.createWorker(options.lang || 'spa+eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Error al procesar la imagen.');
  }
}