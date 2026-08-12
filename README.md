# Volcan-COMM Visual Engine

Motor visual para automatizar reportes ejecutivos de VOLCAN con Google Sheets, Apps Script, Render, Express/EJS y Puppeteer.

## Objetivo de la versión 0.1

La primera versión valida la arquitectura multi-mina con el dashboard **Incidentes vs Requerimientos**.

Scopes soportados:

- `VOLCAN`
- `ANDAYCHAGUA`
- `SAN_CRISTOBAL_CARAHUACRA`
- `CERRO_PASCO`
- `CHUNGAR`
- `ROMINA`
- `TICLIO`
- `SAN_CRISTOBAL`

## Importante: el consolidado depende del reporte

VOLCAN no usa exactamente las mismas unidades en todos los dashboards actuales. Por eso el motor no fija una sola composición global.

- `INC_REQ / VOLCAN`: Andaychagua + San Cristóbal - Carahuacra + Cerro Pasco + Chungar + Romina + Ticlio.
- `TOP10 / VOLCAN`: Andaychagua + San Cristóbal - Carahuacra + Cerro Pasco + Chungar.

Esta diferencia queda configurada en `config/operations.js` mediante `REPORT_SCOPE_MEMBERS`.

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

## Datos de muestra del slide 12

Los datos de prueba de mayo de 2026 se tomaron del dashboard actual `Incidentes vs Requerimientos` del Google Sheet de VOLCAN:

| Scope | Incidentes | Requerimientos | Total |
|---|---:|---:|---:|
| VOLCAN | 210 | 837 | 1047 |
| Andaychagua | 71 | 169 | 240 |
| San Cristóbal - Carahuacra | 59 | 119 | 178 |
| Cerro Pasco | 1 | 67 | 68 |
| Chungar | 54 | 211 | 265 |
| Romina | 3 | 94 | 97 |
| Ticlio | 22 | 177 | 199 |

`San Cristóbal` existe como sección independiente en el dashboard, pero no forma parte del consolidado VOLCAN del slide 12 actual.

## Render

La primera versión usa `npm install` porque el repositorio fue inicializado desde cero y todavía no contiene `package-lock.json`.

## Siguiente etapa

Después de validar visualmente el slide 12 se activarán, reutilizando la misma arquitectura, los módulos de atenciones, Top 10, valorización y suministros.
