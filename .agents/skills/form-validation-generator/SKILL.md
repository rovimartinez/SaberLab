---
name: form-validation-generator
description: Guía y generador de formularios con validación accesible, estados de carga y conexión a Cloudflare Pages Functions en SaberLab.
---

# Generar Formulario con Validación (SaberLab Standard)

Guía operativa para la creación rápida y estandarizada de componentes de captura de datos, validación reactiva y persistencia en SaberLab.

---

## 1. Disparador (Trigger)
Esta habilidad debe activarse cuando:
- El usuario solicite crear una nueva pantalla, modal o sección de captura de datos (ej. registro de proyectos, edición de perfiles, formularios de soporte, creación de grupos o solicitudes de acceso).
- Se requiera estandarizar validaciones de datos en formularios existentes.

---

## 2. Requisitos Previos (Context)
Antes de construir el formulario, consultar los siguientes archivos clave de arquitectura:
- [`src/styles/design-system.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/design-system.css): Tokens CSS semánticos (`var(--surface-card)`, `var(--border-default)`, `var(--brand-primary)`, etc.).
- [`src/lib/api.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/lib/api.js): Cliente HTTP con autenticación JWT automática.
- [`database-architecture-map`](file:///c:/Users/Elizabeth/Desktop/SaberLab/.agents/skills/database-architecture-map/SKILL.md): Esquema de tablas D1 para concordancia de campos.

---

## 3. Entradas Requeridas (Inputs)
Identificar y definir los siguientes elementos antes de codificar:
1. **Campos:** Nombres de variables, etiquetas legibles y tipos de entrada (`text`, `email`, `number`, `select`, `textarea`, `switch`).
2. **Reglas de Validación:**
   - Campos requeridos vs opcionales.
   - Restricciones de longitud, formatos regex (emails, URLs, teléfonos) y rangos numéricos.
3. **Endpoint de Destino:** Ruta en Cloudflare Pages Functions (`/api/...`) y método HTTP (`POST`, `PUT`, `PATCH`).

---

## 4. Procedimiento Paso a Paso (Workflow)

### Paso 1: Definir Esquema de Validación y Estado
Crear un estado de formulario reactivo con validación de errores en tiempo real o en submit:
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  category: 'general'
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

const validate = () => {
  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'El título es obligatorio.';
  if (formData.title.length < 3) newErrors.title = 'Mínimo 3 caracteres.';
  return newErrors;
};
```

### Paso 2: Construir el Componente Visual con Tokens Semánticos
Utilizar las clases y tokens institucionales del sistema de diseño:
- Inputs con clase `.saber-input` o estilo semántico (`background: var(--surface-subtle)`, `border: 1px solid var(--border-default)`).
- Resaltado de foco accesible (`outline: none`, `border-color: var(--brand-primary)`).
- Mensajes de error claros vinculados al campo con color de error (`var(--status-danger)`).

### Paso 3: Conectar al Backend Serverless
Integrar el envío con el helper `api()` de SaberLab:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setLoading(true);
  setFeedback(null);
  
  try {
    const res = await api('/api/mi-endpoint', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (res.success) {
      setFeedback({ type: 'success', message: 'Guardado correctamente.' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al procesar.' });
    }
  } catch (err) {
    setFeedback({ type: 'error', message: 'Error de conexión con el servidor.' });
  } finally {
    setLoading(false);
  }
};
```

### Paso 4: Feedback de Usuario y Accesibilidad
- Deshabilitar el botón de envío durante `loading: true` y mostrar spinner o indicador de progreso.
- Renderizar alertas semánticas de éxito o error con iconos de Lucide (`CheckCircle`, `AlertTriangle`).

---

## 5. Salida Esperada (Expected Output)
- Componente modular, desacoplado y compatible con modo claro/oscuro sin sobrescrituras `!important`.
- 0 advertencias y 0 errores al compilar con `npm run build`.
- Cumplimiento total de las directrices descritas en [`AGENTS.md`](file:///c:/Users/Elizabeth/Desktop/SaberLab/AGENTS.md).
