# Plan de Continuación - SaberLab Evaluation System

## Estado Actual (07-abr-2026)
- **Auto-guardado Instantáneo:** Implementado (Manual Upsert para evitar errores de restricción SQL).
- **Feedback Visual:** Restaurado (los alumnos ven verde/rojo al responder).
- **Overlay de Finalización:** Implementado con botón de cancelación y manejo de errores.
- **Tiempos:** Se restauró la lógica de 20 minutos (eliminada la prueba de 30s).

## Problemas detectados al cierre:
1. **Cronómetro Congelado en 0:00:** El navegador tiene guardado el tiempo de las pruebas de 30 segundos en `localStorage`. Como ese tiempo ya pasó, el examen inicia en 0:00 y no se mueve.
2. **Pantalla de "Finalizando" Persistente:** Como el tiempo es 0:00, el sistema intenta finalizar el examen automáticamente al cargar, mostrando el mensaje de guardado de forma inmediata y bloqueando la interfaz.

## Tareas para Mañana:
1. **Mecanismo de Reset:** Añadir lógica para detectar si un examen guardado en `localStorage` ya expiró y ofrecer un botón de "Reiniciar intento" o limpiarlo automáticamente si no se ha enviado a la DB.
2. **Verificación del Conteo:** Asegurar que el `setTimeout` del timer se reinicie correctamente cuando el tiempo es > 0.
3. **Limpieza de Sesión:** Asegurar que al "Cerrar sesión" se limpien los datos de exámenes pendientes en el navegador.

---
*Nota: No realizar cambios en el código hasta mañana bajo supervisión.*
