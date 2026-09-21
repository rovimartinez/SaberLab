/**
 * simiData.js — Datos y Estructura del Espacio Independiente SIMI3D
 * Semillero de Investigación en Modelado e Impresión 3D
 */

// 1. Catálogo de Pines Tácticos (Estilo Call of Duty / Grados I al V - Progresión 100 a 500 EXP)
export const SIMI_PINS_CATALOG = [
    {
        id: 'pin-tinkercad',
        name: 'Tinkercad Ops',
        shortName: 'Tinkercad',
        category: 'Modelado 3D',
        color: '#f97316',
        icon: 'Box',
        badgeImageUrl: '/badges/tinkercad.webp',
        description: 'Diseño geométrico rápido, sólidos, huecos y ensamblajes didácticos para colegios.',
        tiers: [
            { level: 'I', title: 'Tinkercad I', expReq: 100, reqDesc: 'Crear primer sólido agrupado manifold y exportar .STL' },
            { level: 'II', title: 'Tinkercad II', expReq: 200, reqDesc: 'Diseñar pieza con tolerancias de hueco y alineación perfecta' },
            { level: 'III', title: 'Tinkercad III', expReq: 300, reqDesc: 'Construir mecanismo articulado con holgura de 0.3mm' },
            { level: 'IV', title: 'Tinkercad IV', expReq: 400, reqDesc: 'Modelar kit didáctico escolar completo para impresión rápida' },
            { level: 'V', title: 'Tinkercad V (Prestigio)', expReq: 500, reqDesc: 'Maestro instructor de modelado escolar en visitas de semillero' }
        ]
    },
    {
        id: 'pin-blender',
        name: 'Blender Tactical',
        shortName: 'Blender',
        category: 'Modelado 3D',
        color: '#ec4899',
        icon: 'Sparkles',
        badgeImageUrl: '/badges/blender.webp',
        description: 'Topología poligonal, modificadores, esculpido y optimización de mallas manifold.',
        tiers: [
            { level: 'I', title: 'Blender I', expReq: 100, reqDesc: 'Navegación espacial, transformaciones de precisión y extrusión' },
            { level: 'II', title: 'Blender II', expReq: 200, reqDesc: 'Malla Hard-Surface limpia con Bevel y Mirror sin dobles' },
            { level: 'III', title: 'Blender III', expReq: 300, reqDesc: 'Inspección manifold: 0 caras no continuas y normales orientadas' },
            { level: 'IV', title: 'Blender IV', expReq: 400, reqDesc: 'Esculpido digital con remesh y optimización de polígonos' },
            { level: 'V', title: 'Blender V (Prestigio)', expReq: 500, reqDesc: 'Gran Artífice 3D: Creación de personajes y props para manufactura' }
        ]
    },
    {
        id: 'pin-fusion',
        name: 'Fusion CAD Master',
        shortName: 'Fusion 360',
        category: 'Modelado 3D',
        color: '#06b6d4',
        icon: 'Cpu',
        badgeImageUrl: '/badges/fusion.webp',
        description: 'Diseño mecánico paramétrico, bocetos acotados, restricciones y tolerancia de ensamble.',
        tiers: [
            { level: 'I', title: 'Fusion CAD I', expReq: 100, reqDesc: 'Boceto 2D restringido con cotas dimensionales exactas' },
            { level: 'II', title: 'Fusion CAD II', expReq: 200, reqDesc: 'Extrusión, revolución, roscas y chaflanes mecánicos' },
            { level: 'III', title: 'Fusion CAD III', expReq: 300, reqDesc: 'Ensamble multicomponente con juntas de movimiento (Joints)' },
            { level: 'IV', title: 'Fusion CAD IV', expReq: 400, reqDesc: 'Diseño para Manufactura Aditiva (DFAM) con tolerancias de 0.2mm' },
            { level: 'V', title: 'Fusion CAD V (Prestigio)', expReq: 500, reqDesc: 'Ingeniero Paramétrico Supremo del Semillero' }
        ]
    },
    {
        id: 'pin-slicing',
        name: 'Slicer Vanguard',
        shortName: 'Laminadores',
        category: 'Laminación',
        color: '#10b981',
        icon: 'Layers',
        badgeImageUrl: '/badges/laminadores.webp',
        description: 'Estrategias de código G, soportes de árbol, patrones de relleno y optimización.',
        tiers: [
            { level: 'I', title: 'Slicer I', expReq: 100, reqDesc: 'Laminar primer modelo con Cura / OrcaSlicer y previsualizar capas' },
            { level: 'II', title: 'Slicer II', expReq: 200, reqDesc: 'Configurar soportes orgánicos de árbol con ángulo de voladizo 50°' },
            { level: 'III', title: 'Slicer III', expReq: 300, reqDesc: 'Optimizar relleno Gyroid y altura de capa adaptativa' },
            { level: 'IV', title: 'Slicer IV', expReq: 400, reqDesc: 'Calibración de retracción anti-stringing y costura invisible' },
            { level: 'V', title: 'Slicer V (Prestigio)', expReq: 500, reqDesc: 'Táctico del G-Code: Perfiles maestros para alta velocidad' }
        ]
    },
    {
        id: 'pin-fdm',
        name: 'FDM Operator',
        shortName: 'Impresión FDM',
        category: 'Hardware',
        color: '#eab308',
        icon: 'Flame',
        badgeImageUrl: '/badges/impresion-fmd.webp',
        description: 'Operación de impresoras de filamento (PLA/PETG/TPU), calibración y mantenimiento.',
        tiers: [
            { level: 'I', title: 'FDM I', expReq: 100, reqDesc: 'Calibración de cama (Mesh Bed) y primera capa uniforme' },
            { level: 'II', title: 'FDM II', expReq: 200, reqDesc: 'Impresión exitosa en PETG o ABS con control térmico' },
            { level: 'III', title: 'FDM III', expReq: 300, reqDesc: 'Impresión con filamento flexible (TPU) y ajuste de tracción' },
            { level: 'IV', title: 'FDM IV', expReq: 400, reqDesc: 'Diagnóstico y resolución de atascos, cambio de nozzle y PID tune' },
            { level: 'V', title: 'FDM V (Prestigio)', expReq: 500, reqDesc: 'Comandante de Granja de Impresión FDM' }
        ]
    },
    {
        id: 'pin-sla',
        name: 'SLA Resin Chemist',
        shortName: 'Impresión SLA',
        category: 'Hardware',
        color: '#8b5cf6',
        icon: 'FlaskConical',
        badgeImageUrl: '/badges/impresion-sla.webp',
        description: 'Impresión en resina fotosensible, lavado IPA, curado UV y bioseguridad.',
        tiers: [
            { level: 'I', title: 'SLA I', expReq: 100, reqDesc: 'Protocolo de bioseguridad, guantes, mascarilla y filtrado de resina' },
            { level: 'II', title: 'SLA II', expReq: 200, reqDesc: 'Orientación a 45°, ahuecado de pieza y orificios de drenaje' },
            { level: 'III', title: 'SLA III', expReq: 300, reqDesc: 'Lavado con alcohol isopropílico y cámara de curado UV cronometrada' },
            { level: 'IV', title: 'SLA IV', expReq: 400, reqDesc: 'Calibración de tiempos de exposición por capa con matriz de prueba' },
            { level: 'V', title: 'SLA V (Prestigio)', expReq: 500, reqDesc: 'Alquimista Maestro de Fotopolímeros' }
        ]
    },
    {
        id: 'pin-projects',
        name: 'Project Ops',
        shortName: 'Proyectos',
        category: 'Proyectos',
        color: '#38bdf8',
        icon: 'Rocket',
        badgeImageUrl: '/badges/proyectos.webp',
        description: 'Desarrollo de prototipos funcionales integrados con electrónica y robótica.',
        tiers: [
            { level: 'I', title: 'Proyectos I', expReq: 100, reqDesc: 'Fabricar un ensamble mecánico funcional con rodamientos/tornillería' },
            { level: 'II', title: 'Proyectos II', expReq: 200, reqDesc: 'Diseñar carcasa para circuito electrónico de SaberLab' },
            { level: 'III', title: 'Proyectos III', expReq: 300, reqDesc: 'Prototipo robótico completo con servomotores integrados' },
            { level: 'IV', title: 'Proyectos IV', expReq: 400, reqDesc: 'Sprint Maker: De idea a prototipo funcional terminado en 24h' },
            { level: 'V', title: 'Proyectos V (Prestigio)', expReq: 500, reqDesc: 'Líder Técnico de Prototipado I+D+i' }
        ]
    },
    {
        id: 'pin-school',
        name: 'Field Deployment',
        shortName: 'Visitas Colegios',
        category: 'Extensión',
        color: '#14b8a6',
        icon: 'School',
        badgeImageUrl: '/badges/visitas-escolares.webp',
        description: 'Divulgación escolar, salidas de campo y talleres interactivos para bachillerato.',
        tiers: [
            { level: 'I', title: 'Misión Escolar I', expReq: 100, reqDesc: 'Participar como asistente en una visita a institución educativa' },
            { level: 'II', title: 'Misión Escolar II', expReq: 200, reqDesc: 'Realizar demostración en vivo de impresión 3D a estudiantes' },
            { level: 'III', title: 'Misión Escolar III', expReq: 300, reqDesc: 'Facilitar un taller de modelado en Tinkercad para 20+ alumnos' },
            { level: 'IV', title: 'Misión Escolar IV', expReq: 400, reqDesc: 'Coordinar logística y equipo móvil de impresión para salida escolar' },
            { level: 'V', title: 'Misión Escolar V (Prestigio)', expReq: 500, reqDesc: 'Capitán de Extensión y Divulgación STEAM' }
        ]
    },
    {
        id: 'pin-research',
        name: 'R&D Scientist',
        shortName: 'Investigación',
        category: 'Investigación',
        color: '#f43f5e',
        icon: 'FileText',
        badgeImageUrl: '/badges/investigacion.webp',
        description: 'Redacción científica, formulación de artículos IEEE y ensayos mecánicos.',
        tiers: [
            { level: 'I', title: 'Investigación I', expReq: 100, reqDesc: 'Llevar bitácora de investigación y registro de fallos/parámetros' },
            { level: 'II', title: 'Investigación II', expReq: 200, reqDesc: 'Ejecutar ensayo mecánico de tracción/flexión en probeta impresa' },
            { level: 'III', title: 'Investigación III', expReq: 300, reqDesc: 'Diseñar y sustentar un póster científico del semillero' },
            { level: 'IV', title: 'Investigación IV', expReq: 400, reqDesc: 'Redactar borrador de artículo científico en formato IEEE' },
            { level: 'V', title: 'Investigación V (Prestigio)', expReq: 500, reqDesc: 'Científico Titular de Manufactura Aditiva SIMI3D' }
        ]
    }
];

// 2. Módulos de Aprendizaje No Lineal (Rutas Abiertas)
export const SIMI_TRACKS = [
    {
        id: 'track-tinkercad',
        category: 'Modelado 3D',
        title: 'Modelado en Tinkercad',
        subtitle: 'Diseño Geométrico Rápido & Prototipado Escolar',
        color: '#f97316',
        badge: 'Tinkercad',
        pinId: 'pin-tinkercad',
        icon: 'Box',
        logoUrl: 'https://inside.wooster.edu/technology/wp-content/uploads/sites/83/2018/09/logo-tinkercad-256.png',
        level: 'Iniciación / Rápido',
        software: 'Autodesk Tinkercad (Web)',
        units: [
            { id: 'tk-1', title: 'Entorno de Trabajo y Plano de Construcción', duration: '15 min', type: 'Práctica' },
            { id: 'tk-2', title: 'Agrupación de Sólidos, Huecos y Alineación', duration: '20 min', type: 'Laboratorio' },
            { id: 'tk-3', title: 'Tolerancias para Encastre y Holguras (0.3mm)', duration: '25 min', type: 'Diseño' },
            { id: 'tk-4', title: 'Exportación Manifold (.STL / .OBJ) y Validación', duration: '15 min', type: 'Verificación' }
        ]
    },
    {
        id: 'track-blender',
        category: 'Modelado 3D',
        title: 'Modelado en Blender 3D',
        subtitle: 'Topología Poligonal, Mallas Manifold & Hard-Surface',
        color: '#ec4899',
        badge: 'Blender 3D',
        pinId: 'pin-blender',
        icon: 'Sparkles',
        logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/1280px-Blender_logo_no_text.svg.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
        level: 'Intermedio / Avanzado',
        software: 'Blender 4.x',
        units: [
            { id: 'bl-1', title: 'Navegación Cartesiana y Atajos de Precisión (G, R, S)', duration: '20 min', type: 'Práctica' },
            { id: 'bl-2', title: 'Modo Edición: Flujo de Bucles, Loop Cuts y Bevel', duration: '30 min', type: 'Laboratorio' },
            { id: 'bl-3', title: 'Modificadores Clave: Booleans, Mirror y Remesh', duration: '35 min', type: 'Diseño' },
            { id: 'bl-4', title: 'Limpieza de Malla: 0 Non-Manifold y Normales Azules', duration: '25 min', type: 'Control Calidad' }
        ]
    },
    {
        id: 'track-fusion',
        category: 'Modelado 3D',
        title: 'CAD Mecánico en Fusion 360',
        subtitle: 'Bocetos Paramétricos, Cotas & Ensambles de Precisión',
        color: '#06b6d4',
        badge: 'Fusion 360',
        pinId: 'pin-fusion',
        icon: 'Cpu',
        logoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Fusion360_Logo.svg/1280px-Fusion360_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
        level: 'Avanzado / Ingeniería',
        software: 'Autodesk Fusion 360',
        units: [
            { id: 'fs-1', title: 'Bocetos 2D con Restricciones Geométricas y Cotas', duration: '30 min', type: 'Paramétrico' },
            { id: 'fs-2', title: 'Operaciones 3D: Extrusión, Revolución y Nervios', duration: '35 min', type: 'Laboratorio' },
            { id: 'fs-3', title: 'Roscas Mecánicas, Chaflanes y Tolerancias de 0.2mm', duration: '40 min', type: 'Mecánica' },
            { id: 'fs-4', title: 'Ensambles Multicomponente y Juntas de Movimiento', duration: '45 min', type: 'Ensamble' }
        ]
    },
    {
        id: 'track-cura',
        category: 'Laminación',
        title: 'UltiMaker Cura',
        subtitle: 'Laminador Clásico, Soportes de Árbol y Perfiles FDM',
        color: '#2563eb',
        badge: 'Laminador',
        pinId: 'pin-slicing',
        icon: 'Layers',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Logo_for_Cura_Software.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
        level: 'Iniciación / Intermedio',
        software: 'UltiMaker Cura 5.x',
        units: [
            { id: 'cu-1', title: 'Configuración Inicial y Selección de Boquilla / Material', duration: '15 min', type: 'Básico' },
            { id: 'cu-2', title: 'Soportes Normales vs Árbol y Densidad de Relleno', duration: '20 min', type: 'Soportes' },
            { id: 'cu-3', title: 'Ajustes de Adherencia: Brim, Raft y Skirt', duration: '20 min', type: 'Adherencia' },
            { id: 'cu-4', title: 'Generación y Guardado de G-Code Optimizado', duration: '15 min', type: 'G-Code' }
        ]
    },
    {
        id: 'track-orcaslicer',
        category: 'Laminación',
        title: 'OrcaSlicer',
        subtitle: 'Laminación de Alta Velocidad, Calibración & Direct-Drive',
        color: '#10b981',
        badge: 'Laminador Pro',
        pinId: 'pin-slicing',
        icon: 'Layers',
        logoUrl: 'https://orcaslicer.pro/wp-content/uploads/2025/02/download-orca-slicer-new-verion-2025-1024x1024.webp',
        level: 'Avanzado / Velocidad',
        software: 'OrcaSlicer (Bambu / Klipper)',
        units: [
            { id: 'os-1', title: 'Pruebas Integradas de Flujo y Presión (Pressure Advance)', duration: '25 min', type: 'Calibración' },
            { id: 'os-2', title: 'Soportes Orgánicos y Alturas de Capa Variables', duration: '25 min', type: 'Optimización' },
            { id: 'os-3', title: 'Alineación Automática de Costuras y Velocidades Dinámicas', duration: '30 min', type: 'Ajustes' },
            { id: 'os-4', title: 'Control Multi-Placa y Conexión Directa WiFi', duration: '20 min', type: 'Flujo' }
        ]
    },
    {
        id: 'track-prusaslicer',
        category: 'Laminación',
        title: 'PrusaSlicer',
        subtitle: 'Precisión Geométrica, Modificadores & Rellenos Orgánicos',
        color: '#ea580c',
        badge: 'Laminador Abierto',
        pinId: 'pin-slicing',
        icon: 'Layers',
        logoUrl: 'https://help.prusa3d.com/wp-content/uploads/PSlogo-1.jpg',
        level: 'Intermedio / Avanzado',
        software: 'PrusaSlicer 2.x',
        units: [
            { id: 'ps-1', title: 'Corte de Modelos, Clavijas de Unión y Conectores', duration: '20 min', type: 'Malla' },
            { id: 'ps-2', title: 'Pintado de Soportes Manuales y Bloqueadores', duration: '25 min', type: 'Soportes' },
            { id: 'ps-3', title: 'Relleno Giroidal y Estructuras Livianas DFAM', duration: '25 min', type: 'Rellenos' },
            { id: 'ps-4', title: 'Exportación y Previsualización Capa a Capa', duration: '20 min', type: 'Verificación' }
        ]
    },
    {
        id: 'track-fdm',
        category: 'Equipos & Manufactura',
        title: 'Impresión 3D FDM / FFF',
        subtitle: 'Termoplásticos: PLA, PETG, ABS, TPU y Mantenimiento',
        color: '#eab308',
        badge: 'Hardware FDM',
        pinId: 'pin-fdm',
        icon: 'Flame',
        logoUrl: 'https://i.postimg.cc/NMYNqM4F/ender-3.png',
        level: 'Práctico en Taller',
        software: 'Firmware Marlin / Klipper / Kobra / Ender',
        units: [
            { id: 'fdm-0', title: 'Hardware & Cinemática', fullTitle: 'Anatomía de la Máquina FDM, Cinemáticas y Sistemas de Movimiento', duration: '30 min', type: 'Hardware' },
            { id: 'fdm-1', title: 'Nivelación & Z-Offset', fullTitle: 'Nivelación de Cama (Mesh Bed) y Calibración de Offset Z', duration: '25 min', type: 'Taller' },
            { id: 'fdm-2', title: 'Filamentos & Térmica', fullTitle: 'Control Térmico y Ciencia de Filamentos (PLA/PETG/ABS/TPU)', duration: '30 min', type: 'Materiales' },
            { id: 'fdm-3', title: 'Atascos & Boquillas', fullTitle: 'Resolución de Atascos, Boquillas y PID Tuning', duration: '35 min', type: 'Mantenimiento' },
            { id: 'fdm-4', title: 'Insertos & DFAM', fullTitle: 'Inserciones Roscadas por Calor y Encastres Mecánicos', duration: '30 min', type: 'Post-Proceso' }
        ]
    },
    {
        id: 'track-sla',
        category: 'Equipos & Manufactura',
        title: 'Manufactura en Resina SLA / MSLA',
        subtitle: 'Fotopolímeros, Fotocurado UV, Lavado IPA & Bioseguridad',
        color: '#8b5cf6',
        badge: 'Hardware SLA',
        pinId: 'pin-sla',
        icon: 'FlaskConical',
        logoUrl: 'https://somosmaker.com/wp-content/uploads/2025/06/Halot-R6_1-300x300.webp',
        level: 'Alta Precisión / Química',
        software: 'Anycubic / Elegoo / ChiTuBox / Halot',
        units: [
            { id: 'sla-0', title: 'Hardware MSLA & Óptica', fullTitle: 'Fotopolimerización en Cuba, Pantallas LCD Monocromo y Luz UV', duration: '25 min', type: 'Hardware' },
            { id: 'sla-1', title: 'Bioseguridad & EPP', fullTitle: 'Protocolo de Seguridad Química, EPP, Ventilación y Filtrado', duration: '20 min', type: 'Seguridad' },
            { id: 'sla-2', title: 'Orientación & Ahuecado', fullTitle: 'Inclinación a 45°, Succión FEP, Ahuecado y Agujeros de Drenaje', duration: '30 min', type: 'Preparación' },
            { id: 'sla-3', title: 'Lavado IPA & Post-Curado', fullTitle: 'Estación de Lavado con Isopropanol, Secado y Horno UV', duration: '25 min', type: 'Post-Proceso' },
            { id: 'sla-4', title: 'Calibración & Tiempos', fullTitle: 'Matriz de Exposición, Cones of Calibration y Espesor de Capa', duration: '30 min', type: 'Calibración' }
        ]
    }
];

// 3. Calendario Inicial de Visitas a Colegios y Eventos
export const SIMI_SCHOOL_EVENTS = [
    {
        id: 'evt-1',
        schoolName: 'I.E.D. Técnico Industrial de Santa Marta',
        date: '2026-09-25',
        time: '8:30 AM – 12:00 PM',
        location: 'Aula Múltiple STEAM',
        status: 'Programada',
        leader: 'Ing. Ronny Martinez Reyes',
        assistants: ['Líder SIMI', '2 Semilleristas'],
        objective: 'Taller demostrativo de modelado 3D rápido en Tinkercad e impresión en vivo de piezas para robótica.',
        equipment: ['2× Impresoras 3D FDM portátiles', '10× Muestras impresas en filamento y resina', 'Proyector'],
        badgeTier: 'Misión Escolar II'
    },
    {
        id: 'evt-2',
        schoolName: 'Colegio Bilingüe San José',
        date: '2026-10-14',
        time: '9:00 AM – 1:00 PM',
        location: 'Laboratorio de Ciencias e Informática',
        status: 'En Preparación',
        leader: 'Ing. Ronny Martinez Reyes',
        assistants: ['Líder SIMI', '3 Semilleristas'],
        objective: 'Feria de la Ciencia: Stand del Semillero SIMI3D con demostración de escaneo tridimensional y piezas mecánicas.',
        equipment: ['1× Escáner 3D de luz estructurada', '1× Impresora FDM', 'Muestras de prótesis y biomodelos'],
        badgeTier: 'Misión Escolar III'
    },
    {
        id: 'evt-3',
        schoolName: 'I.E.D. Rodrigo de Bastidas',
        date: '2026-11-06',
        time: '2:00 PM – 5:30 PM',
        location: 'Sala de Cómputo Principal',
        status: 'Planificada',
        leader: 'Ing. Ronny Martinez Reyes',
        assistants: ['Líderes de Semillero'],
        objective: 'Capacitación docente y taller de diseño paramétrico con Fusion 360 para proyectos de grado escolar.',
        equipment: ['Guías impresas del semillero', 'Pendrives con perfiles de software', 'Kit de ensamble STEAM'],
        badgeTier: 'Misión Escolar IV'
    }
];

// 4. Repositorio de Proyectos I+D+i del Semillero
export const SIMI_PROJECTS = [
    {
        id: 'SIMI0001',
        title: 'Brazo Robótico Articulado 4-DOF SaberLab',
        author: 'Semillero SIMI3D',
        status: 'Prototipado',
        material: 'PETG Negro & PLA Cian',
        printTime: '18h 45m',
        weightGrams: 340,
        cadTool: 'Fusion 360',
        description: 'Estructura mecánica impresa con tolerancias de 0.25mm para servomotores MG996R y rodamientos 608ZZ.'
    },
    {
        id: 'SIMI0002',
        title: 'Carcasa Modular para Multímetro Digital SaberLab',
        author: 'Línea de Prototipado',
        status: 'Completado y Validado',
        material: 'PLA+ Alta Resistencia',
        printTime: '4h 10m',
        weightGrams: 95,
        cadTool: 'Fusion 360',
        description: 'Chasis ergonómico con inserciones roscadas de latón M3 para fijación de pantalla OLED y tarjeta ESP32.'
    },
    {
        id: 'SIMI0003',
        title: 'Biomodelo Anatómico Cardíaco para Docencia',
        author: 'Línea Biomodelado SLA',
        status: 'Pruebas y Validación',
        material: 'Resina Fotopolimérica Flexible',
        printTime: '7h 30m',
        weightGrams: 120,
        cadTool: 'Blender 4.x',
        description: 'Modelo ahuecado con espesor de pared de 2mm y textura de cavidades ventriculares para prácticas escolares.'
    }
];

// 5. Inventario de Recursos y Equipamiento del Semillero (Editable)
export const INITIAL_SIMI_RESOURCES = [
    {
        id: 'res-1',
        name: 'Creality Ender-3 V3 SE',
        category: 'Impresora FDM',
        status: 'Operativa',
        quantity: 2,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDRbLCo-FK2eZTLgsafRiOTlAq-S_WiKWuEREMQ1lOK-Z_Qf1U876H1iQ&s=10',
        specs: 'Cama 220×220×250mm • Nivelación Automática CR-Touch • Velocidad hasta 250mm/s',
        location: 'Laboratorio STEAM / Sala 3D',
        color: '#eab308'
    },
    {
        id: 'res-2',
        name: 'Creality Halot-R6 MSLA',
        category: 'Impresora Resina SLA',
        status: 'Operativa',
        quantity: 1,
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsMpX3vj1uXzmfrAZJPcttQVYMDOWjt4fjU3HjyoQo4-4TcPdXHMCN5_6I&s=10',
        specs: 'Pantalla Monocromática 4K • Volumen 130×82×160mm • Fuente de Luz Integral',
        location: 'Cabina de Fotopolímeros',
        color: '#8b5cf6'
    },
    {
        id: 'res-3',
        name: 'Filamento PLA+ Cian SaberLab (1kg)',
        category: 'Filamento',
        status: 'En Stock',
        quantity: 5,
        specs: '1.75mm • Temp: 205°C - 215°C • Cama: 60°C • Baja contracción',
        location: 'Caja Estanca de Secado 1',
        color: '#06b6d4'
    },
    {
        id: 'res-4',
        name: 'Filamento PETG Negro Industrial (1kg)',
        category: 'Filamento',
        status: 'En Stock',
        quantity: 3,
        specs: '1.75mm • Alta resistencia térmica e impacto • Temp: 235°C',
        location: 'Caja Estanca de Secado 2',
        color: '#38bdf8'
    },
    {
        id: 'res-5',
        name: 'Resina UV Estándar Gris Anycubic (1L)',
        category: 'Resina Fotosensible',
        status: 'En Stock',
        quantity: 2,
        specs: '405nm • Exposición 2.5s • Alta resolución para biomodelos',
        location: 'Armario de Bioseguridad',
        color: '#a855f7'
    },
    {
        id: 'res-6',
        name: 'Kit de Inserciones Roscadas de Latón M3/M4',
        category: 'Insumo / Ferretería',
        status: 'Disponible',
        quantity: 120,
        specs: 'Tuercas moleteadas para fusión térmica en plástico con cautín',
        location: 'Organizador de Prototipado',
        color: '#10b981'
    }
];

// 6. Catálogo de Fuentes, Herramientas Web & IA 3D de SIMI
export const SIMI_WEB_RESOURCES = [
    {
        id: 'web-makerworld',
        name: 'MakerWorld (Bambu Lab)',
        url: 'https://makerworld.com/',
        host: 'makerworld.com',
        category: 'Repositorios & Modelos',
        tag: 'Ecosistema Bambu',
        badge: 'Top Repositorio',
        color: '#06b6d4',
        icon: 'Box',
        featured: true,
        description: 'Plataforma con perfiles listos para imprimir, integración directa con software de laminado y modelos optimizados multicolor.'
    },
    {
        id: 'web-printables',
        name: 'Printables (Prusa Research)',
        url: 'https://www.printables.com/',
        host: 'printables.com',
        logoUrl: 'https://media.printables.com/media/prints/345980/images/2945638_c78c16e0-120d-451b-8d6c-af3a466cee40/thumbs/inside/1280x960/png/printables_400x400.webp',
        category: 'Repositorios & Modelos',
        tag: 'Perfiles Probados & Concursos',
        badge: 'Prusa Hub',
        color: '#fa5d00',
        icon: 'Box',
        featured: true,
        description: 'Modelos de alta calidad orientados a impresión 3D (STL, 3MF, G-code), organizados con perfiles probados y concursos comunitarios.'
    },
    {
        id: 'web-thingiverse',
        name: 'Thingiverse (MakerBot / UltiMaker)',
        url: 'https://www.thingiverse.com/',
        host: 'thingiverse.com',
        category: 'Repositorios & Modelos',
        tag: 'Comunidad Histórica Maker',
        badge: 'Gran Repositorio',
        color: '#0284c7',
        icon: 'Globe',
        featured: true,
        description: 'Uno de los repositorios gratuitos más grandes e históricos para impresión 3D y proyectos maker de código abierto.'
    },
    {
        id: 'web-cults3d',
        name: 'Cults 3D',
        url: 'https://cults3d.com/',
        host: 'cults3d.com',
        category: 'Repositorios & Modelos',
        tag: 'Arte & Decoración 3D',
        badge: 'Diseño Creativo',
        color: '#9333ea',
        icon: 'Sparkles',
        featured: true,
        description: 'Comunidad con gran catálogo de diseños artísticos, decoración y figuras; ofrece opciones tanto gratuitas como de pago.'
    },
    {
        id: 'web-thangs',
        name: 'Thangs 3D',
        url: 'https://thangs.com/',
        host: 'thangs.com',
        category: 'Repositorios & Modelos',
        tag: 'Buscador Geométrico AI',
        badge: 'Meta-Buscador 3D',
        color: '#10b981',
        icon: 'Search',
        featured: true,
        description: 'Buscador geométrico avanzado que indexa modelos de su propia plataforma y de decenas de otros sitios web a la vez.'
    },
    {
        id: 'web-myminifactory',
        name: 'MyMiniFactory',
        url: 'https://www.myminifactory.com/',
        host: 'myminifactory.com',
        category: 'Repositorios & Modelos',
        tag: 'Miniaturas & Escultura',
        badge: 'Modelos Validados',
        color: '#e11d48',
        icon: 'Rocket',
        featured: false,
        description: 'Especializada en miniaturas para juegos de mesa, escultura digital y cosplay; todos los modelos son probados antes de publicarse.'
    },
    {
        id: 'web-sketchfab',
        name: 'Sketchfab',
        url: 'https://sketchfab.com/',
        host: 'sketchfab.com',
        logoUrl: 'https://static.sketchfab.com/img/press/logos/sketchfab-logo.png',
        category: 'Repositorios & Modelos',
        tag: 'Visor 3D, FBX & GLTF',
        badge: 'Visor WebGL Líder',
        color: '#1caad9',
        icon: 'Layers',
        featured: true,
        description: 'Enfocada en renderizado, animación y videojuegos (formatos FBX, OBJ, GLTF), con visor 3D interactivo en el navegador.'
    },
    {
        id: 'web-turbosquid',
        name: 'TurboSquid',
        url: 'https://turbosquid.com/',
        host: 'turbosquid.com',
        category: 'Repositorios & Modelos',
        tag: 'Activos Pro Cine & Games',
        badge: 'Estándar Industria',
        color: '#f59e0b',
        icon: 'Cpu',
        featured: false,
        description: 'Orientada a la industria profesional de videojuegos, cine y arquitectura; cuenta con activos de alta fidelidad (gratuitos y comerciales).'
    },
    {
        id: 'web-cgtrader',
        name: 'CGTrader',
        url: 'https://www.cgtrader.com/',
        host: 'cgtrader.com',
        logoUrl: 'https://d1ewbp317vsrbd.cloudfront.net/d555179e-053b-40e3-bf01-f41c0bb57dcd.png',
        category: 'Repositorios & Modelos',
        tag: 'Mercado 3D & Animación',
        badge: 'Mercado Global',
        color: '#06b6d4',
        icon: 'Package',
        featured: false,
        description: 'Mercado amplio de modelos poligonales para animación, diseño de interiores y render, además de una sección para impresión 3D.'
    },
    {
        id: 'web-free3d',
        name: 'Free3D',
        url: 'https://free3d.com/',
        host: 'free3d.com',
        category: 'Repositorios & Modelos',
        tag: 'Activos Gratuitos Multi-Formato',
        badge: 'Recursos Libres',
        color: '#3b82f6',
        icon: 'Box',
        featured: false,
        description: 'Colección generalista de activos 3D gratuitos en formatos estándar (BLEND, OBJ, C4D, MAX) para proyectos audiovisuales o videojuegos.'
    },
    {
        id: 'web-flow-test',
        name: 'Test de Flujo Volumétrico (15-30 mm³/s)',
        url: 'https://makerworld.com/es/models/2621640-basic-flow-test-15-30-flow?from=search#profileId-2893720',
        host: 'makerworld.com',
        category: 'Calibración & Afinación',
        tag: 'Calibración FDM',
        badge: 'Flujo & Hotend',
        color: '#eab308',
        icon: 'Flame',
        featured: true,
        description: 'Prueba de calibración de flujo volumétrico para determinar la tasa máxima de extrusión del hotend. Evita atascos y subextrusión en impresiones rápidas.'
    },
    {
        id: 'web-models-test',
        name: 'Banco de Tests 3D & Calibración',
        url: 'https://makerworld.com/es/search/models?keyword=test',
        host: 'makerworld.com',
        category: 'Calibración & Afinación',
        tag: 'Benchies & Tolerancias',
        badge: 'Afinación FDM',
        color: '#f59e0b',
        icon: 'FlaskConical',
        featured: false,
        description: 'Catálogo de modelos de prueba de MakerWorld: Benchies 3D, torres de temperatura, pruebas de tolerancia mecánica, puentes y voladizos extremos.'
    },
    {
        id: 'web-teaching-tech',
        name: 'Teaching Tech 3D Calibration Suite',
        url: 'https://teachingtechyt.github.io/calibration.html',
        host: 'teachingtechyt.github.io',
        logoUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kRtIOW7AUMB72XCkUCJwdrWnF3C8bNoXIHOJFqizwI60g=s900-c-k-c0x00ffffff-no-rj',
        category: 'Calibración & Afinación',
        tag: 'Suite Interactiva',
        badge: 'Suite Experta',
        color: '#ef4444',
        icon: 'Cpu',
        featured: true,
        description: 'La suite web interactiva de calibración más completa: pasos de extrusor (E-Steps), retracción, PID tuning, aceleración y primera capa uniforme.'
    },
    {
        id: 'web-image-to-3d',
        name: 'MakerLab Image to 3D',
        url: 'https://makerworld.com/es/makerlab/imageTo3d',
        host: 'makerworld.com',
        category: 'MakerLab Paramétrico',
        tag: 'IA & Relieve 3D',
        badge: 'Generador Web',
        color: '#10b981',
        icon: 'Sparkles',
        featured: true,
        description: 'Herramienta oficial de MakerLab que convierte fotografías, ilustraciones y dibujos 2D en modelos 3D volumétricos con relieve listos para imprimir.'
    },
    {
        id: 'web-image-to-keychain',
        name: 'MakerLab Image to Keychain',
        url: 'https://makerworld.com/es/makerlab/imageToKeychain?from=makerlab',
        host: 'makerworld.com',
        category: 'MakerLab Paramétrico',
        tag: 'Llaveros & Escolar',
        badge: 'Ideal Talleres',
        color: '#14b8a6',
        icon: 'School',
        featured: true,
        description: 'Generador paramétrico para crear llaveros personalizados y placas con ojal a partir de imágenes o texto en menos de dos minutos. Perfecto para visitas escolares.'
    },
    {
        id: 'web-makerlab-suite',
        name: 'MakerLab Suite Oficial de Herramientas',
        url: 'https://makerworld.com/es/makerlab?from=navbar',
        host: 'makerworld.com',
        category: 'MakerLab Paramétrico',
        tag: 'Suite Paramétrica',
        badge: 'Suite Maker',
        color: '#38bdf8',
        icon: 'Layers',
        featured: false,
        description: 'Centro completo de generadores paramétricos web: litofanías curvas, cajas modulares con tapa deslizante, generadores de engranajes y texto 3D.'
    },
    {
        id: 'web-meshy-ai',
        name: 'Meshy.ai (Texto / Imagen a 3D)',
        url: 'https://www.meshy.ai/',
        host: 'meshy.ai',
        logoUrl: 'https://cdn.meshy.ai/landing-assets/media-kit/meshy-logo-general.webp',
        category: 'IA 3D',
        tag: 'Texturas PBR',
        badge: 'IA PBR',
        color: '#8b5cf6',
        icon: 'Sparkles',
        featured: true,
        description: 'Plataforma líder de IA generativa para crear modelos 3D completos a partir de texto o imágenes, incluyendo malla poligonal limpia y mapas PBR.'
    },
    {
        id: 'web-tripo-ai',
        name: 'Tripo3D (Generador Ultra-Rápido 3D)',
        url: 'https://www.tripo3d.ai/',
        host: 'tripo3d.ai',
        category: 'IA 3D',
        tag: 'Mallas Rápidas',
        badge: 'IA Rápida',
        color: '#a855f7',
        icon: 'Rocket',
        featured: true,
        description: 'Generador 3D por IA de ultra alta velocidad: produce mallas tridimensionales con buena topología en menos de 10 segundos, exportables en STL y OBJ.'
    },
    {
        id: 'web-tripo-compressor',
        name: 'Compresor de Archivos GLB (Tripo)',
        url: 'https://www.tripo3d.ai/es/3d-tools/file-compressor/glb',
        host: 'tripo3d.ai',
        category: 'IA 3D',
        tag: 'Compresor 3D',
        badge: 'Optimización',
        color: '#9333ea',
        icon: 'Layers',
        featured: true,
        description: 'Herramienta web especializada para comprimir y reducir el peso de modelos 3D en formato GLB/glTF, optimizando mallas y texturas sin pérdida visible de calidad.'
    },
    {
        id: 'web-ender-bed-level',
        name: 'Calibración Manual de Cama (Ender 3 / FDM)',
        url: 'https://www.thingiverse.com/thing:2987803',
        host: 'thingiverse.com',
        category: 'Calibración & Afinación',
        tag: 'Nivelación Cama FDM',
        badge: 'Nivelación Cama',
        color: '#0284c7',
        icon: 'Target',
        featured: true,
        description: 'Patrón de prueba y código de nivelación manual para camas calientes de Ender 3 e impresoras FDM. Permite calibrar la holgura con galga/papel y verificar la adherencia de la primera capa en las 4 esquinas y centro.'
    },
    {
        id: 'web-retraction-test',
        name: 'Test de Retracción & Anti-Hilos',
        url: 'https://www.thingiverse.com/thing:2563909',
        host: 'thingiverse.com',
        category: 'Calibración & Afinación',
        tag: 'Anti-Hilos / Stringing',
        badge: 'Retracción FDM',
        color: '#6366f1',
        icon: 'Sliders',
        featured: true,
        description: 'Modelo de torres dobles de rápida impresión para calibrar la distancia y velocidad de retracción, eliminando el hilado (stringing) y residuos entre desplazamientos.'
    },
    {
        id: 'web-angle-overhang-test',
        name: 'Test de Ángulo & Voladizos (Overhang)',
        url: 'https://www.thingiverse.com/thing:1564848',
        host: 'thingiverse.com',
        category: 'Calibración & Afinación',
        tag: 'Voladizos & Ángulos',
        badge: 'Prueba Voladizo',
        color: '#f59e0b',
        icon: 'Triangle',
        featured: true,
        description: 'Patrón calibrado con pendientes progresivas de 20° a 70° para evaluar el flujo de enfriamiento de capa (fan duct) y determinar el ángulo límite sin soportes.'
    },
    {
        id: 'web-temp-tower',
        name: 'Torre de Temperatura Universal (Temp Tower)',
        url: 'https://www.thingiverse.com/thing:4625077',
        host: 'thingiverse.com',
        category: 'Calibración & Afinación',
        tag: 'Temperatura & Fusión',
        badge: 'Torre Temp',
        color: '#ef4444',
        icon: 'Thermometer',
        featured: true,
        description: 'Torre modular de calibración térmica con bloques escalonados por temperatura, puentes y voladizos para hallar la temperatura óptima en PLA, PETG y ABS.'
    },
    {
        id: 'web-bambu-pla-guide',
        name: 'Guía Oficial de Filamento PLA (Bambu Lab)',
        url: 'https://wiki.bambulab.com/es/filament/pla',
        host: 'wiki.bambulab.com',
        category: 'Guías Técnicas & Wikis',
        tag: 'Filamento PLA & Propiedades',
        badge: 'Wiki Oficial',
        color: '#00ae42',
        icon: 'BookOpen',
        featured: true,
        description: 'Documentación técnica completa sobre filamentos PLA: variantes (Basic, Matte, Tough, Silk, CF), temperaturas recomendadas de boquilla y cama, ventilación y mejores prácticas de adhesión.'
    },
    {
        id: 'web-bambu-ironing',
        name: 'Alisado Superficial / Ironing (Bambu Studio)',
        url: 'https://wiki.bambulab.com/es/software/bambu-studio/parameter/ironing',
        host: 'wiki.bambulab.com',
        category: 'Guías Técnicas & Wikis',
        tag: 'Alisado Térmico / Ironing',
        badge: 'Acabado Superior',
        color: '#06b6d4',
        icon: 'Sparkles',
        featured: true,
        description: 'Guía paso a paso del parámetro Ironing (alisado superficial) en el laminador: funcionamiento, velocidad de desplazamiento, flujo de planchado y cómo lograr superficies planas ultra suaves sin líneas de capa.'
    },
    {
        id: 'web-bambu-filament-guide',
        name: 'Guía Maestra de Filamentos & Accesorios',
        url: 'https://wiki.bambulab.com/es/filament-acc',
        host: 'wiki.bambulab.com',
        category: 'Guías Técnicas & Wikis',
        tag: 'Guía Global Filamentos',
        badge: 'Catálogo & Parámetros',
        color: '#8b5cf6',
        icon: 'Layers',
        featured: true,
        description: 'Compendio maestro de filamentos técnicos y accesorios para impresión 3D: tablas comparativas de resistencia térmica y mecánica, compatibilidad de boquillas y pautas de secado.'
    },
    {
        id: 'web-orcaslicer',
        name: 'OrcaSlicer (GitHub Oficial)',
        url: 'https://github.com/SoftFever/OrcaSlicer/releases',
        host: 'github.com',
        logoUrl: 'https://orcaslicer.pro/wp-content/uploads/2025/02/download-orca-slicer-new-verion-2025-1024x1024.webp',
        category: 'Laminadores & Slicers',
        tag: 'FDM Alta Velocidad & Calibración',
        badge: 'Descarga Oficial',
        color: '#009688',
        icon: 'Layers',
        featured: true,
        description: 'Laminador de código abierto líder para impresoras de alta velocidad (Bambu, Creality K1, Voron, Ender). Herramientas nativas de calibración de flujo, presión advance y retracción.'
    },
    {
        id: 'web-bambu-studio',
        name: 'Bambu Studio (Bambu Lab)',
        url: 'https://bambulab.com/es/download/studio',
        host: 'bambulab.com',
        category: 'Laminadores & Slicers',
        tag: 'Ecosistema Bambu AMS',
        badge: 'Descarga Oficial',
        color: '#00ae42',
        icon: 'Layers',
        featured: true,
        description: 'Laminador oficial con soporte nativo para impresión multicolor (AMS), monitoreo remoto por cámara en tiempo real, corte avanzado por pasos y sincronización en la nube.'
    },
    {
        id: 'web-prusaslicer',
        name: 'PrusaSlicer (Prusa Research)',
        url: 'https://www.prusa3d.com/es/pagina/prusaslicer_424/',
        host: 'prusa3d.com',
        logoUrl: 'https://help.prusa3d.com/wp-content/uploads/PSlogo-1.jpg',
        category: 'Laminadores & Slicers',
        tag: 'Soportes Orgánicos & FDM/SLA',
        badge: 'Descarga Oficial',
        color: '#fa5d00',
        icon: 'Layers',
        featured: true,
        description: 'Laminador potente y de código abierto desarrollado por Prusa Research. Pionero en soportes orgánicos tipo árbol, corte inteligente de piezas grandes y perfiles comunitarios.'
    },
    {
        id: 'web-ultimaker-cura',
        name: 'UltiMaker Cura',
        url: 'https://ultimaker.com/software/ultimaker-cura/',
        host: 'ultimaker.com',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Logo_for_Cura_Software.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
        category: 'Laminadores & Slicers',
        tag: 'Estándar Académico & Plugins',
        badge: 'Descarga Oficial',
        color: '#0066cc',
        icon: 'Layers',
        featured: true,
        description: 'El laminador más extendido en entornos educativos e industriales, con cientos de perfiles FDM integrados de fábrica y tienda de plugins (Marketplace) para extender sus capacidades.'
    },
    {
        id: 'web-creality-print',
        name: 'Creality Print (Creality Oficial)',
        url: 'https://www.creality.com/pages/download-software',
        host: 'creality.com',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDRbLCo-FK2eZTLgsafRiOTlAq-S_WiKWuEREMQ1lOK-Z_Qf1U876H1iQ&s=10',
        category: 'Laminadores & Slicers',
        tag: 'Series Ender, K1 & Halot',
        badge: 'Descarga Oficial',
        color: '#0284c7',
        icon: 'Layers',
        featured: false,
        description: 'Plataforma oficial de corte y gestión remota de flotas para impresoras Creality. Conexión inalámbrica por red local o nube Creality Cloud y perfiles afinados de fábrica.'
    },
    {
        id: 'web-chitubox',
        name: 'CHITUBOX (Laminador Resina SLA/MSLA)',
        url: 'https://www.chitubox.com/en/download/chitubox-basic',
        host: 'chitubox.com',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsMpX3vj1uXzmfrAZJPcttQVYMDOWjt4fjU3HjyoQo4-4TcPdXHMCN5_6I&s=10',
        category: 'Laminadores & Slicers',
        tag: 'Impresión 3D Resina UV',
        badge: 'Descarga Oficial',
        color: '#3b82f6',
        icon: 'Layers',
        featured: true,
        description: 'El laminador de resina fotosensible más usado del mundo. Generación automática y manual de micro-soportes, ahuecado de sólidos para ahorro de resina y agujeros de drenaje anti-succión.'
    },
    {
        id: 'web-lychee-slicer',
        name: 'Lychee Slicer (Resina SLA & Filamento FDM)',
        url: 'https://mango3d.io/downloads/',
        host: 'mango3d.io',
        logoUrl: 'https://media.licdn.com/dms/image/v2/D4E0BAQEF7ovgGpBt5A/company-logo_200_200/company-logo_200_200/0/1721895245381/lychee3d_logo?e=2147483647&v=beta&t=6JuBuZYuxZcRAJA2ChW_80ky-yMrsi8OX0V63uIq6BA',
        category: 'Laminadores & Slicers',
        tag: 'Soportes Inteligentes & Nube',
        badge: 'Descarga Oficial',
        color: '#ec4899',
        icon: 'Layers',
        featured: false,
        description: 'Laminador visual con detección automática de islas flotantes, optimización de tiempo de exposición por resina en base de datos comunitaria y soporte para impresoras FDM y SLA.'
    }
];
