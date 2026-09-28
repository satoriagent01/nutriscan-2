# NutriScan - Plan del Proyecto

## Requisitos

### Funcionalidades principales
1. **Escaneo de etiquetas nutricionales**: El usuario puede tomar fotos o subir imágenes de las tablas nutricionales de productos del supermercado
2. **OCR con IA**: Extraer automáticamente los datos de la tabla nutricional usando Tesseract.js
3. **Seguidor de nutrición personalizado**: Rastrear cualquier nutriente (calorías, sodio, grasas saturadas, etc.)
4. **Planificador de comidas**: Crear platos especificando gramos de cada ingrediente
5. **Gratis y sin anuncios**: Para quienes quieren cuidar su dieta

### Casos de uso (basados en imágenes proporcionadas)
- Escanear tablas nutricionales multilingües (alemán, francés, neerlandés, italiano, español)
- Extraer datos de tablas con diferentes formatos (por 100g, por porción, por porción en ml)
- Manejar productos con diferentes unidades (g, ml, kJ, kcal)
- Extraer información de ingredientes y alérgenos

## Arquitectura

### Stack tecnológico
- **Frontend**: HTML, CSS, JavaScript vanilla (sin frameworks)
- **OCR**: Tesseract.js (librería de OCR para navegador)
- **Almacenamiento**: LocalStorage del navegador
- **Testing**: Node.js con el runner de pruebas integrado

### Estructura del proyecto
```
nutri-scan/
├── src/
│   ├── lib/
│   │   ├── ocr.js              # Módulo OCR con Tesseract.js
│   │   ├── nutrition-parser.js # Parser de tablas nutricionales
│   │   ├── storage.js          # Wrapper de LocalStorage
│   │   └── meal-planner.js     # Lógica del planificador de comidas
│   ├── views/
│   │   ├── home.js             # Vista principal
│   │   ├── scan.js             # Vista de escaneo
│   │   ├── product-detail.js   # Detalle del producto
│   │   ├── meals.js            # Planificador de comidas
│   │   ├── dashboard.js        # Dashboard de nutrición
│   │   └── history.js          # Historial de escaneos
│   ├── styles/
│   │   └── main.css            # Estilos principales
│   └── app.js                  # Punto de entrada y router
├── public/
│   └── index.html              # HTML principal
├── docs/
│   └── PLAN.md                 # Este archivo
└── tests/
    └── ...                     # Pruebas unitarias
```

## Decisiones de diseño

1. **OCR determinístico con IA**: Usar Tesseract.js para el OCR y luego un parser determinístico para extraer los datos de la tabla nutricional
2. **Almacenamiento local**: No se requiere backend ni base de datos; todos los datos se guardan en LocalStorage
3. **SPA (Single Page Application)**: Navegación sin recarga de página
4. **Diseño responsive**: Funciona en móvil y escritorio
5. **Soporte multilingüe**: El parser debe manejar tablas en diferentes idiomas

## Próximos pasos

- Implementar el OCR con Tesseract.js
- Crear el parser de tablas nutricionales
- Implementar el almacenamiento en LocalStorage
- Crear las vistas de la aplicación
- Añadir el planificador de comidas
- Implementar el dashboard con estadísticas
- Testing y depuración