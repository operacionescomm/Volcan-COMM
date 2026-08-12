# Apps Script - Volcan-COMM v0.1

Este código se ejecutará desde el Google Sheet de VOLCAN y construye el payload para `POST /render/slide12`.

## Propiedades requeridas

En **Configuración del proyecto → Propiedades del script**:

- `RENDER_BASE_URL`: URL pública del servicio Render, sin `/` final.
- `RENDER_API_KEY`: misma clave generada/configurada en Render.
- `VOLCAN_SPREADSHEET_ID`: opcional si el script está vinculado directamente al Sheet.

## Pruebas iniciales

- `testRenderIncReqVolcan()`
- `testRenderIncReqAndaychagua()`

También se agrega el menú `VOLCAN · Automatización` al abrir el Google Sheet.

## Lectura dinámica

El script no usa filas fijas para las tablas mensuales. Busca cada sección por su título, identifica la fila `Mes | Incidente | Requerimiento` y localiza el período seleccionado.

Para `VOLCAN` valida que la suma de Andaychagua, San Cristóbal - Carahuacra, Cerro Pasco, Chungar, Romina y Ticlio coincida con la fila consolidada de VOLCAN antes de enviar el payload a Render. Si no cuadra, detiene la generación y muestra el detalle de la diferencia.
