# Apps Script - Volcan-COMM

El Google Sheet usa `CONTROL_AUTOMATIZACION!B2` como **periodo maestro** del motor.

## Flujo obligatorio

Antes de validar o renderizar un reporte, el AppScript debe ejecutar:

```javascript
const sync = volcanPrepareRun();
```

Ese paso sincroniza el periodo de CONTROL hacia:

- `Incidentes vs Requerimientos!Q2`
- `Top 10 Req e Inc!R1`
- `Costo_Servicio!R2`
- `ToTen_Sum!X2`

Luego verifica que los cuatro selectores coincidan con `CONTROL_AUTOMATIZACION!B2`. Si alguno queda desfasado, detiene la ejecución para evitar generar una presentación mezclando meses distintos.

El módulo está en `ControlSync.gs`.

## Fuentes limpias por bloque

- Slides 19–26: `Incidentes vs Requerimientos`
- Slides 27–32: `Top 10 Req e Inc`
  - 27–28: acumulado móvil de 12 meses
  - 29–32: mes anterior vs periodo seleccionado
- Slides 34–42: `Costo_Servicio`
  - ventana móvil de 12 meses
- Slides 44–52: `ToTen_Sum` + `Costo_Servicio`
  - general VOLCAN: acumulado 12 meses
  - U.M.: periodo seleccionado

Los borradores (`TopTen_Req_Inc`, `TopTen_Raiz_Inc`, `Base de Costo_Servicio`, `Copia de ToTen_Sum`) no deben ser leídos directamente por el motor de presentación. Sus datos llegan al motor a través de las hojas limpias.

## Periodos soportados

El selector maestro de CONTROL está preparado hasta **DIC-26**. Los periodos futuros pueden seleccionarse aunque todavía no tengan datos; las hojas limpias deben devolver vacío/0 según su lógica, nunca copiar automáticamente el mes anterior.

## Propiedades requeridas

En **Configuración del proyecto → Propiedades del script**:

- `RENDER_BASE_URL`: URL pública del servicio Render, sin `/` final.
- `RENDER_API_KEY`: misma clave configurada en Render.
- `VOLCAN_SPREADSHEET_ID`: opcional si el script está vinculado directamente al Sheet.

## Pruebas disponibles

- `volcanSyncPeriodFromControl()`
- `volcanVerifySync()`
- `testRenderIncReqVolcan()`
- `testRenderIncReqAndaychagua()`

El menú `VOLCAN · Automatización` incluye una opción para sincronizar manualmente el periodo desde CONTROL.
