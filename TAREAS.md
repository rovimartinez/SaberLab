# SaberLab - Lista de Tareas

## 🔴 REPARACIONES (Ahora)

- [ ] 1. Evaluación Módulo 1 RE - Hacer que funcione correctamente (mostrar, tomar, guardar)
- [ ] 2. Verificar visibilidad admin → estudiante - Test completo del flujo
- [ ] 3. Completar lección - Guardar progreso en BD cuando estudiante marca "Marcar como completada"

---

## 🟡 MEDIA (Necesario)

- [ ] 4. Migrar cursos a BD - Cuando haya 100+ cursos, mover definición a Supabase
- [ ] 5. Progreso del estudiante - Guardar avance real en BD (lecciones completadas, % progreso)
- [ ] 6. Inscribir estudiante a grupo - Implementar flujo completo desde MyCourses
- [ ] 7. Notificaciones push - Enviar notificaciones cuando se publiquen nuevas lecciones
- [ ] 8. Dashboard analytics - Mostrar estadísticas reales a estudiantes (progreso, tiempo, etc.)

---

## 🟢 BAJA (Mejora)

- [ ] 9. Tablas sin uso - Limpiar o implementar: student_lesson_progress, student_quiz_attempts, student_mission_progress
- [ ] 10. Tablas analíticas - student_learning_sessions, student_content_events (si se necesitan métricas)
- [ ] 11. Perfiles de estudiante - Completar datos adicionales (escuela, grado, etc.)
- [ ] 12. Logros/Achievements - Sistema de logros por completar módulos/cursos
- [ ] 13. Leaderboard - Tabla de posiciones entre estudiantes

---

## 🔧 TECH DEBT (Limpieza)

- [ ] 14. Borrar tabla vieja visibilidad_leccion_curso
- [ ] 15. Limpiar código console.log de debug
- [ ] 16. Eliminar archivos tmp_lesson_head.jsx si no se usa
- [ ] 17. Revisar eslint warnings

---

## 📝 NOTAS

- Evaluación Módulo 1 de RE está definida en código (src/evaluations/RE/m1/module1Evaluation.js)
- Lecciones 1-5 de RE tienen contenido real (l1-l5)
- El resto de lecciones están vacías (load: null)
