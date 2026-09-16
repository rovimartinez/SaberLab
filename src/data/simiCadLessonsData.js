// ==========================================================================
// simiCadLessonsData.js: Contenidos de Rutas Tinkercad, Blender y Fusion 360
// ==========================================================================

export const SIMI_CAD_LESSONS_DATA = {
    // ── RUTA 1: AUTODESK TINKERCAD ──
    'track-tinkercad': {
        id: 'track-tinkercad',
        title: 'Modelado en Tinkercad',
        badge: 'Tinkercad',
        level: 'Iniciación / Rápido',
        color: '#f97316',
        pinId: 'pin-tinkercad',
        units: [
            {
                id: 'tk-1',
                unitIndex: 1,
                title: 'Entorno & Planos',
                fullTitle: 'Entorno de Trabajo y Plano de Construcción',
                duration: '15 min',
                type: 'Práctica',
                expReward: 25,
                summary: 'Navegación espacial, el cubo de vistas (ViewCube), manipulación de la rejilla de trabajo (Snap Grid) y colocación de primitivas básicas.',
                sections: [
                    {
                        title: '1. El Espacio de Trabajo Tridimensional en Tinkercad',
                        content: `
                            Tinkercad es un entorno de modelado paramétrico basado en geometría sólida constructiva (**CSG - Constructive Solid Geometry**).
                            
                            * **Plano de Trabajo Principal:** Malla milimétrica en el plano $XY$.
                            * **Ajuste de Rejilla (Snap Grid):** Configuración de incrementos de movimiento desde $0.1\\,\\text{mm}$ hasta $5.0\\,\\text{mm}$.
                            * **Navegación Táctica:** Clic derecho para orbitar, rueda central para zoom y clic en rueda para paneo libre.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 170" width="100%" height="160" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="170" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#f97316" font-size="13" font-weight="bold" text-anchor="middle">📐 Espacio y Rejilla de Construcción Tinkercad</text>
                                <g transform="translate(60, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#f97316" stroke-width="1.5"/>
                                    <text x="100" y="25" fill="#f97316" font-size="11" font-weight="bold" text-anchor="middle">Plano de Trabajo (W)</text>
                                    <text x="100" y="50" fill="#f8fafc" font-size="9.5" text-anchor="middle">Superficie de referencia</text>
                                    <text x="100" y="75" fill="#94a3b8" font-size="9" text-anchor="middle">Reorientable en cualquier cara</text>
                                </g>
                                <g transform="translate(280, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
                                    <text x="100" y="25" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Regla Métrica (R)</text>
                                    <text x="100" y="50" fill="#f8fafc" font-size="9.5" text-anchor="middle">Cotas en tiempo real</text>
                                    <text x="100" y="75" fill="#94a3b8" font-size="9" text-anchor="middle">Distancias X, Y, Z exactas</text>
                                </g>
                                <g transform="translate(500, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="100" y="25" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Snap Grid</text>
                                    <text x="100" y="50" fill="#f8fafc" font-size="9.5" text-anchor="middle">Paso de 1.0 / 0.1 mm</text>
                                    <text x="100" y="75" fill="#94a3b8" font-size="9" text-anchor="middle">Control de precisión milimétrica</text>
                                </g>
                            </svg>
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué atajo de teclado permite colocar un plano de trabajo auxiliar sobre cualquier cara inclinada en Tinkercad?',
                    options: [
                        'Tecla W (Workplane)',
                        'Tecla R (Ruler)',
                        'Tecla D (Drop to floor)',
                        'Tecla L (Align)'
                    ],
                    correctIndex: 0,
                    explanation: 'Pulsar la tecla W permite situar instantáneamente un plano de construcción temporal sobre cualquier cara de un objeto 3D.'
                }
            },
            {
                id: 'tk-2',
                unitIndex: 2,
                title: 'Sólidos & Huecos',
                fullTitle: 'Agrupación de Sólidos, Huecos y Alineación',
                duration: '20 min',
                type: 'Laboratorio',
                expReward: 25,
                summary: 'Operaciones booleanas fundamentales (Unión, Diferencia), herramienta de alineación (L) y duplicado con repetición inteligente (Ctrl+D).',
                sections: [
                    {
                        title: '1. Creación de Formas Complejas mediante Booleanas',
                        content: `
                            En Tinkercad cualquier objeto puede ser **Sólido** o **Hueco (Hole)**.
                            
                            * **Unión (Group - Ctrl+G):** Combina dos o más sólidos en una sola malla continua.
                            * **Sustracción (Hole + Solid -> Group):** Resta el volumen del cuerpo hueco sobre el sólido, perforando agujeros, chavetas y vaciados internos.
                            * **Alineación de Precisión (L):** Permite alinear centros, bordes y alturas entre múltiples geometrías con un solo clic.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué combinación de teclas agrupa sólidos y huecos seleccionados para fusionar o perforar una geometría en Tinkercad?',
                    options: [
                        'Ctrl + G (Group)',
                        'Ctrl + D (Duplicate)',
                        'Ctrl + H (Hide)',
                        'Shift + A (Align)'
                    ],
                    correctIndex: 0,
                    explanation: 'Ctrl + G ejecuta la operación booleana de agrupación (Group), uniendo sólidos y sustrayendo los volúmenes configurados como huecos.'
                }
            },
            {
                id: 'tk-3',
                unitIndex: 3,
                title: 'Tolerancias & Encastres',
                fullTitle: 'Tolerancias para Encastre y Holguras (0.3mm)',
                duration: '25 min',
                type: 'Diseño DFAM',
                expReward: 25,
                summary: 'Compensación de expansión térmica en plástico, holguras diametrales para encastres mecánicos y mecanismos impresos en un solo paso (Print-in-Place).',
                sections: [
                    {
                        title: '1. Reglas de Holgura para FDM Escolar',
                        content: `
                            Las boquillas FDM extruyen plástico caliente que sufre una ligera expansión térmica lateral (**Die Swell**).
                            
                            * **Junta Giratoria / Bisagra Print-in-Place:** Holgura mínima recomendada de **$0.35\\,\\text{mm}$ a $0.40\\,\\text{mm}$**.
                            * **Encastre Deslizante (Caja con Tapa):** Holgura de **$0.25\\,\\text{mm}$**.
                            * **Encastre Rígido a Presión:** Holgura de **$0.10\\,\\text{mm}$**.
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es la holgura recomendada entre partes móviles al diseñar una bisagra articulada tipo Print-in-Place para FDM?',
                    options: [
                        'Entre 0.35 mm y 0.40 mm',
                        '0.01 mm',
                        '2.5 mm',
                        '0.00 mm (contacto directo)'
                    ],
                    correctIndex: 0,
                    explanation: 'Una holgura de 0.35 - 0.40 mm evita que el filamento de capas adyacentes se fusione durante la deposición térmica, permitiendo que la articulación gire libremente al retirarse de la cama.'
                }
            },
            {
                id: 'tk-4',
                unitIndex: 4,
                title: 'Exportación & Manifold',
                fullTitle: 'Exportación Manifold (.STL / .OBJ) y Validación',
                duration: '15 min',
                type: 'Verificación',
                expReward: 25,
                summary: 'Exportación limpia a formato .STL, orientación de piezas y comprobación de mallas estancas sin geometrías no continuas.',
                sections: [
                    {
                        title: '1. De la Pantalla al Archivo de Fabricación',
                        content: `
                            Al exportar un diseño para imprimir:
                            * **Formato .STL (Standard Triangle Language):** Representa la superficie como una triangulación cerrada.
                            * **Malla Manifold (Estanca):** Una geometría que no posee caras abiertas, bordes sueltos ni normales invertidas. Si un objeto no es manifold, el laminador no sabrá qué parte es sólida y cuál es hueca.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué significa que un modelo 3D sea "Manifold"?',
                    options: [
                        'Que es geométricamente estanco (Water-tight), sin agujeros en la malla ni caras interiores de espesor cero.',
                        'Que tiene más de 1 millón de polígonos.',
                        'Que fue modelado únicamente con cubos.',
                        'Que solo puede imprimirse en color azul.'
                    ],
                    correctIndex: 0,
                    explanation: 'Una malla manifold es matemáticamente cerrada y continua en el espacio, garantizando que el software de laminado pueda calcular el interior sólido y el exterior con precisión.'
                }
            }
        ]
    },

    // ── RUTA 2: BLENDER 3D ──
    'track-blender': {
        id: 'track-blender',
        title: 'Modelado en Blender 3D',
        badge: 'Blender 3D',
        level: 'Intermedio / Avanzado',
        color: '#ec4899',
        pinId: 'pin-blender',
        units: [
            {
                id: 'bl-1',
                unitIndex: 1,
                title: 'Atajos & Espacio',
                fullTitle: 'Navegación Cartesiana y Atajos de Precisión (G, R, S)',
                duration: '20 min',
                type: 'Práctica',
                expReward: 25,
                summary: 'Convención Z-Up, sistema de coordenadas global vs local, transformaciones de precisión numérica y manipulación del 3D Cursor.',
                sections: [
                    {
                        title: '1. Atajos Esenciales de Transformación',
                        content: `
                            Blender se opera mediante teclado de alta velocidad:
                            * **G (Grab / Move):** Desplaza vértices, aristas u objetos.
                            * **R (Rotate):** Rota sobre el eje de vista o eje bloqueado ($X, Y, Z$).
                            * **S (Scale):** Escala proporcionalmente o sobre ejes bloqueados ($S + Z + 0$ aplana geometrías).
                            * **Shift + Z:** Bloquea el eje $Z$ y transforma solo en el plano horizontal $XY$.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué combinación de teclas permite escalar un objeto en Blender restringiendo la transformación únicamente al plano horizontal X-Y?',
                    options: [
                        'S + Shift + Z',
                        'S + Z + Z',
                        'Alt + S',
                        'Ctrl + Shift + S'
                    ],
                    correctIndex: 0,
                    explanation: 'S activa el escalado y Shift + Z excluye el eje Z, aplicando la escala de manera uniforme sobre los ejes X e Y.'
                }
            },
            {
                id: 'bl-2',
                unitIndex: 2,
                title: 'Modo Edición',
                fullTitle: 'Modo Edición: Flujo de Bucles, Loop Cuts y Bevel',
                duration: '30 min',
                type: 'Laboratorio',
                expReward: 25,
                summary: 'Selección de Vértices (1), Aristas (2) y Caras (3), corte de bucle (Ctrl+R), biselado (Ctrl+B) y extrusión múltiple (E).',
                sections: [
                    {
                        title: '1. Topología Hard-Surface y Bucles de Soporte',
                        content: `
                            * **Extrusión (E):** Genera nueva geometría proyectada a lo largo de las normales.
                            * **Loop Cut (Ctrl + R):** Inserta un anillo continuo de aristas dividiendo caras cuadriláteras (Quads).
                            * **Biselado (Ctrl + B):** Suaviza esquinas vivas agregando chaflanes o redondeos mecánicos de alta resistencia.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué atajo de teclado inserta un bucle de aristas continuo (Loop Cut) en Modo Edición dentro de Blender?',
                    options: [
                        'Ctrl + R',
                        'Ctrl + B',
                        'Alt + E',
                        'Shift + D'
                    ],
                    correctIndex: 0,
                    explanation: 'Ctrl + R activa la herramienta Loop Cut, permitiendo deslizar y multiplicar bucles continuos de aristas a lo largo de caras de 4 lados.'
                }
            },
            {
                id: 'bl-3',
                unitIndex: 3,
                title: 'Modificadores',
                fullTitle: 'Modificadores Clave: Booleans, Mirror y Remesh',
                duration: '35 min',
                type: 'Diseño Paramétrico',
                expReward: 25,
                summary: 'Flujo de trabajo no destructivo con modificador Mirror (Simetría), Booleanas exactas y Subdivision Surface.',
                sections: [
                    {
                        title: '1. Modelado No Destructivo para Prototipado',
                        content: `
                            Los modificadores aplican transformaciones procedurales que pueden editarse en cualquier momento:
                            * **Mirror Modifier:** Modela la mitad de un objeto y duplica la geometría simétrica con soldadura automática de vértices centrales (*Clipping*).
                            * **Boolean Modifier (Fast / Exact):** Unión, diferencia e intersección matemática entre sólidos complejos.
                            * **Solidify:** Otorga espesor milimétrico uniforme a superficies laminares.
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué es fundamental activar la casilla "Clipping" en el modificador Mirror al modelar piezas simétricas?',
                    options: [
                        'Para evitar que los vértices del eje central se crucen o se separen, soldándolos de forma fija en la línea de simetría.',
                        'Para que el modelo se vuelva transparente.',
                        'Para reducir el peso del archivo .blend.',
                        'Para exportar automáticamente a .STL.'
                    ],
                    correctIndex: 0,
                    explanation: 'Clipping bloquea los vértices centrales en el plano de simetría, impidiendo que se crucen o dejen aberturas no continuas en el medio de la pieza.'
                }
            },
            {
                id: 'bl-4',
                unitIndex: 4,
                title: 'Control Calidad 3D',
                fullTitle: 'Limpieza de Malla: 0 Non-Manifold y Normales Azules',
                duration: '25 min',
                type: 'Control Calidad',
                expReward: 25,
                summary: 'Herramienta 3D Print Toolbox, comprobación de normales de cara (Face Orientation), eliminación de dobles (Merge by Distance) y preparación para impresión.',
                sections: [
                    {
                        title: '1. Protocolo de Inspección Pre-Impresión en Blender',
                        content: `
                            Antes de enviar un archivo a impresión:
                            1. **Recalcular Normales (Shift + N):** Todas las caras exteriores deben mostrarse de color **Azul** en el visor de orientación de caras.
                            2. **Merge by Distance (M -> By Distance):** Elimina vértices duplicados superpuestos en la misma coordenada.
                            3. **3D Print Toolbox:** Comprueba 0 aristas no continuas (*Non-Manifold Edges*) y 0 caras intersectadas (*Overhangs*).
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué color deben mostrar las caras exteriores de un modelo en el visor Face Orientation de Blender para garantizar que las normales están orientadas correctamente hacia afuera?',
                    options: [
                        'Azul (Azul = Exterior / Rojo = Interior invertido)',
                        'Rojo',
                        'Verde',
                        'Amarillo'
                    ],
                    correctIndex: 0,
                    explanation: 'El estándar de visualización de normales en Blender pinta en Azul las caras que apuntan correctamente hacia afuera y en Rojo las caras interiores o invertidas.'
                }
            }
        ]
    },

    // ── RUTA 3: AUTODESK FUSION 360 ──
    'track-fusion': {
        id: 'track-fusion',
        title: 'CAD Mecánico en Fusion 360',
        badge: 'Fusion 360',
        level: 'Avanzado / Ingeniería',
        color: '#06b6d4',
        pinId: 'pin-fusion',
        units: [
            {
                id: 'fs-1',
                unitIndex: 1,
                title: 'Bocetos & Cotas',
                fullTitle: 'Bocetos 2D con Restricciones Geométricas y Cotas',
                duration: '30 min',
                type: 'Paramétrico',
                expReward: 25,
                summary: 'Bocetos completamente definidos (Fully Constrained - Líneas Negras), cotas dimensionales exactas (D) y restricciones geométricas (Coincidente, Tangente, Simetría, Paralelismo).',
                sections: [
                    {
                        title: '1. Filosofía del Boceto Paramétrico',
                        content: `
                            En el diseño mecánico profesional, ningún boceto debe quedar con líneas azules sin restringir.
                            
                            * **Línea Azul (Under-constrained):** Posee grados de libertad sueltos y puede deformarse accidentalmente.
                            * **Línea Negra (Fully constrained):** Completamente restringida mediante cotas dimensionales y relaciones geométricas contra el origen cartesiano $(0,0,0)$.
                            * **Restricciones Clave:** Horizontal/Vertical, Tangente (para arcos y empalmes suaves), Concéntrico (agujeros de tornillería) y Colineal.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué indica el cambio de color de azul a negro en las líneas de un boceto 2D dentro de Fusion 360?',
                    options: [
                        'Que el boceto está completamente restringido (Fully Constrained) con dimensiones y posiciones geométricas fijas.',
                        'Que la línea fue borrada.',
                        'Que el boceto se convirtió en un sólido 3D.',
                        'Que hay un error de sintaxis en el archivo.'
                    ],
                    correctIndex: 0,
                    explanation: 'Las líneas negras indican que todos los grados de libertad del boceto han sido bloqueados mediante cotas y restricciones geométricas.'
                }
            },
            {
                id: 'fs-2',
                unitIndex: 2,
                title: 'Operaciones Sólidas',
                fullTitle: 'Operaciones 3D: Extrusión, Revolución y Nervios',
                duration: '35 min',
                type: 'Laboratorio',
                expReward: 25,
                summary: 'Operaciones de volumen: Extrude (E), Revolve, Sweep, Loft, vaciado (Shell) y nervios de refuerzo mecánico (Rib).',
                sections: [
                    {
                        title: '1. Generación de Cuerpos Sólidos Paramétricos',
                        content: `
                            * **Extrusión (E):** Proyección recta de un perfil cerrado con control de ángulos de desmoldeo (*Taper Angle*).
                            * **Revolución (Revolve):** Gira un perfil cerrado alrededor de un eje central para fabricar poleas, ejes y bujes cilíndricos.
                            * **Nervios (Rib):** Añade aletas de refuerzo estructural delgado para rigidizar carcasas contra flexión con mínimo consumo de material.
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es la función de la herramienta "Rib" (Nervio) en el diseño de carcasas plásticas en Fusion 360?',
                    options: [
                        'Crear paredes delgadas de refuerzo estructural a partir de una simple línea de boceto para evitar deformaciones mecánicas.',
                        'Cortar el modelo por la mitad.',
                        'Cambiar el color del polímero.',
                        'Generar texto grabado sobre la pieza.'
                    ],
                    correctIndex: 0,
                    explanation: 'La herramienta Rib genera refuerzos mecánicos automáticos sobre superficies plásticas delgadas, optimizando la resistencia con bajo peso.'
                }
            },
            {
                id: 'fs-3',
                unitIndex: 3,
                title: 'Roscas & Tolerancias',
                fullTitle: 'Roscas Mecánicas, Chaflanes y Tolerancias de 0.2mm',
                duration: '40 min',
                type: 'Mecánica',
                expReward: 25,
                summary: 'Creación de roscas métricas modeladas (Modeled Thread - ISO Metric), chaflanes de entrada y compensación de tolerancias de ensamble.',
                sections: [
                    {
                        title: '1. Roscas para Impresión 3D',
                        content: `
                            * Para imprimir una rosca funcional en 3D, se debe marcar la casilla **Modeled** en el comando *Thread* de Fusion 360.
                            * Las roscas $M6, M8, M10$ en adelante imprimen con excelente resistencia mecánica. Para tornillos finos ($M2, M3, M4$) se recomienda usar insertos de latón por termofusión.
                            * **Offset Face (Q):** Aplicar un desfase negativo de $-0.15\\,\\text{mm}$ en los flancos de la rosca para garantizar un atornillado suave sin atascos.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué opción debe activarse en el comando "Thread" de Fusion 360 para que la geometría de la rosca se genere físicamente en la malla 3D y pueda imprimirse?',
                    options: [
                        'Casilla "Modeled"',
                        'Casilla "Cosmetic"',
                        'Casilla "Full Length"',
                        'Casilla "Tolerance Fast"'
                    ],
                    correctIndex: 0,
                    explanation: 'Si no se marca "Modeled", la rosca solo se muestra como una textura visual cosmética y el archivo .STL saldrá como un cilindro liso.'
                }
            },
            {
                id: 'fs-4',
                unitIndex: 4,
                title: 'Ensambles & Juntas',
                fullTitle: 'Ensambles Multicomponente y Juntas de Movimiento',
                duration: '45 min',
                type: 'Ensamble',
                expReward: 25,
                summary: 'Creación de componentes independientes, restricciones de ensamble (Joints - Rigid, Revolute, Slider) y simulación de movimiento cinemático.',
                sections: [
                    {
                        title: '1. Ensambles de Prototipos Robóticos',
                        content: `
                            * **Componentes vs Cuerpos:** Cada pieza móvil debe ser un *Component* independiente en el árbol de operaciones.
                            * **Juntas Cinemáticas (Joint - J):**
                              * **Rigid:** Bloquea los 6 grados de libertad.
                              * **Revolute:** Permite rotación alrededor de un eje (ejes de motor, ruedas, brazos robóticos).
                              * **Slider:** Permite traslación lineal a lo largo de un riel guía.
                            * **Detección de Colisiones:** Análisis de interferencias en tiempo real para verificar que las partes no choquen durante su recorrido.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué tipo de junta (Joint) se utiliza en Fusion 360 para modelar la unión giratoria de una rueda o engranaje sobre un eje de motor?',
                    options: [
                        'Revolute Joint',
                        'Rigid Joint',
                        'Slider Joint',
                        'Planar Joint'
                    ],
                    correctIndex: 0,
                    explanation: 'Revolute Joint bloquea las traslaciones pero libera 1 grado de libertad angular de rotación pura alrededor del eje seleccionado.'
                }
            }
        ]
    }
};
