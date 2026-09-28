# NutriScan

**NutriScan** es una aplicación web gratuita y sin anuncios para rastrear la nutrición escaneando las etiquetas de productos del supermercado.

## Características

- 📸 **Escaneo de etiquetas**: Toma fotos o sube imágenes de las tablas nutricionales
- 🤖 **OCR con IA**: Extrae automáticamente los datos nutricionales usando Tesseract.js
- 📊 **Seguidor personalizado**: Rastrea calorías, sodio, grasas saturadas, y cualquier nutriente
- 🍽️ **Planificador de comidas**: Crea platos con porciones personalizadas
- 📈 **Dashboard**: Visualiza tu progreso y estadísticas nutricionales
- 💾 **Almacenamiento local**: Todos tus datos se guardan en el navegador

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

Abre `http://localhost:3000` en tu navegador.

## Pruebas

```bash
npm test
```

## Tecnologías

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **OCR**: Tesseract.js para reconocimiento óptico de caracteres
- **Almacenamiento**: LocalStorage del navegador
- **Testing**: Node.js con el runner de pruebas integrado

## Estructura del proyecto

```
nutri-scan/
├── src/
│   ├── lib/           # Módulos de lógica (OCR, parser, storage, meal planner)
│   ├── views/         # Vistas de la aplicación
│   ├── styles/        # Estilos CSS
│   └── app.js         # Punto de entrada
├── public/            # Archivos estáticos
├── docs/              # Documentación
└── tests/             # Pruebas
```

## ¿Qué no está hecho aún?

- Sincronización en la nube
- Base de datos de productos
- Escaneo de códigos de barras
- Exportación de datos
- Soporte para múltiples idiomas (actualmente solo español y neerlandés)

## Licencia

MIT