# Volcan-COMM Visual Engine

Motor visual para automatizar reportes ejecutivos de VOLCAN con Google Sheets, Apps Script, Render, Express/EJS y Puppeteer.

## Objetivo de la versión 0.1

La primera versión valida la arquitectura multi-mina con el dashboard **Incidentes vs Requerimientos**.

Scopes soportados:

- `VOLCAN`: consolidado de Andaychagua, San Cristóbal - Carahuacra, Cerro Pasco y Chungar.
- `ANDAYCHAGUA`
- `SAN_CRISTOBAL_CARAHUACRA`
- `CERRO_PASCO`
- `CHUNGAR`

## Arquitectura

Google Sheets → Apps Script → Render → Express/EJS → Puppeteer → PNG 1600x900 → Google Slides.

## Endpoints iniciales

- `GET /health`
- `GET /browser-status`
- `GET /scopes`
- `GET /test-slide12?scope=VOLCAN`
- `GET /test-slide12-png?scope=VOLCAN`
- `POST /render/slide12`

El `POST /render/slide12` acepta `scope`, `periodo`, KPIs y filas por unidad minera. Si `RENDER_API_KEY` está definida, requiere el header `x-api-key`.

## Datos de muestra

Los datos de prueba de mayo de 2026 se tomaron del dashboard actual de VOLCAN en Google Sheets:

| Scope | Incidentes | Requerimientos | Total |
|---|---:|---:|---:|
| VOLCAN | 185 | 566 | 751 |
| Andaychagua | 71 | 169 | 240 |
| San Cristóbal - Carahuacra | 59 | 119 | 178 |
| Cerro Pasco | 1 | 67 | 68 |
| Chungar | 54 | 211 | 265 |

## Siguiente etapa

Después de validar visualmente el slide 12 se activarán, reutilizando la misma arquitectura, los módulos de atenciones, Top 10, valorización y suministros.
