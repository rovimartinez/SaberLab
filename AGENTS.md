# SaberLab - Estado del Proyecto

## ✅ ÚLTIMO: HOY (05-abr-2026)
- Visibilidad de lecciones migrada a JSON (tabla visibilidad_curso)
- Tablas renombradas a español
- Admin configurado (rovimartinez@gmail.com)
- Tabla cursos creada en BD (referencia futura)

---

## 🔴 PENDIENTES (Prioridad)

### Alta
1. **Completar lección** - Lesson.jsx solo hace console.log, necesita guardar en BD
2. **Verificar que visibilidad funcione** - Test completo admin → estudiante

### Media  
3. Migrar cursos a BD cuando sean 100+
4. Revisar otros datos locales que deberían persistir

### Baja
5. Tablas pendientes sin uso (student_lesson_progress, etc.)

---

## 📋 HISTORIAL RECIENTE

### Hoy
- visiblidad_leccion_curso → visibilidad_curso (JSON)
- Todas las tablas renombradas a español
- Admin creado: rovimartinez@gmail.com

### Ayer
- Visibilidad de lecciones (primera implementación)

---

## 🔧 ESTADO ACTUAL

| Componente | Estado |
|------------|--------|
| Admin | ✅ Funcionando |
| Cursos (definición) | 📝 En código |
| Visibilidad lecciones | ✅ JSON en BD |
| Insripciones | ✅ BD |
| Grupos | ✅ BD |
| Evaluaciones | ✅ BD |
| Progreso estudiante | ⚠️ Solo console.log |

---

## 🚀 PRÓXIMA SESIÓN

1. Probar visibilidad admin → estudiante
2. Opcional: Completar lección (guardar en BD)

---

## 📝 NOTAS

- Cursos definidos en `coursesData.jsx`, NO en BD
- Tabla `cursos` en BD vacía, para futuro
- Tabla `visibilidad_curso` usa JSON: `{"re-m1-l1": false}`
- IDs normalizados: `re-m1-l1` (no solo `l1`)
