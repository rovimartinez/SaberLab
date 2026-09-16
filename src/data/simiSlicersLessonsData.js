// ==========================================================================
// simiSlicersLessonsData.js: Contenidos de Rutas Cura, OrcaSlicer y PrusaSlicer
// ==========================================================================

export const SIMI_SLICERS_LESSONS_DATA = {
    // ── RUTA 4: ULTIMAKER CURA ──
    'track-cura': {
        id: 'track-cura',
        title: 'UltiMaker Cura',
        badge: 'Laminador',
        level: 'Iniciación / Intermedio',
        color: '#2563eb',
        pinId: 'pin-slicing',
        units: [
            {
                id: 'cu-1',
                unitIndex: 1,
                title: 'Perfiles & Parámetros',
                fullTitle: 'Configuración Inicial y Selección de Boquilla / Material',
                duration: '15 min',
                type: 'Básico',
                expReward: 25,
                summary: 'Configuración de impresora, diámetro de boquilla (0.4 vs 0.6 mm), altura de capa estándar (0.20 mm) y temperaturas recomendadas.',
                sections: [
                    {
                        title: '1. El Motor de Laminación y Alturas de Capa',
                        content: `
                            UltiMaker Cura traduce modelos 3D (.STL/.3MF) en instrucciones de trayectoria (**G-Code**).
                            
                            * **Altura de Capa (Layer Height):** Regla del $25\\%$ al $75\\%$ del diámetro de boquilla. Con boquilla de $0.4\\,\\text{mm}$, las alturas válidas van de $0.10\\,\\text{mm}$ (alta definición) a $0.28\\,\\text{mm}$ (impresión rápida).
                            * **Paredes Perimetrales (Wall Line Count):** Mínimo $3$ a $4$ líneas de pared ($1.2-1.6\\,\\text{mm}$) para piezas estructurales resistentes.
                        `
                    }
                ],
                quiz: {
                    question: 'Para una boquilla estándar de 0.4 mm, ¿cuál es la altura de capa más equilibrada entre velocidad y calidad visual?',
                    options: [
                        '0.20 mm (50% del diámetro del nozzle)',
                        '0.80 mm',
                        '0.01 mm',
                        '1.20 mm'
                    ],
                    correctIndex: 0,
                    explanation: '0.20 mm representa la altura de capa estándar universal para boquillas de 0.4 mm, ofreciendo un excelente equilibrio entre resistencia, adhesión y tiempo de impresión.'
                }
            },
            {
                id: 'cu-2',
                unitIndex: 2,
                title: 'Soportes de Árbol',
                fullTitle: 'Soportes Normales vs Árbol y Densidad de Relleno',
                duration: '20 min',
                type: 'Soportes',
                expReward: 25,
                summary: 'Ángulo de voladizo crítico (50°), soportes orgánicos de árbol (Tree Supports) que ahorran hasta 60% de material y patrones de relleno resistentes.',
                sections: [
                    {
                        title: '1. Soportes de Árbol (Tree Supports)',
                        content: `
                            * **Soportes Normales:** Columnas verticales rígidas que dejan marcas cuadradas en la superficie.
                            * **Soportes de Árbol (Tree Supports):** Ramificaciones curvas que nacen desde la cama y abrazan el modelo sin tocar las paredes exteriores, ahorrando hasta un $60\\%$ de material y desprendiéndose con la mano sin herramientas.
                            * **Relleno Giroide (Gyroid):** Estructura sinusoidal tridimensional isotrópica con idéntica resistencia mecánica en todos los ejes.
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es la principal ventaja de usar soportes de árbol (Tree Supports) frente a los soportes tradicionales en Cura?',
                    options: [
                        'Crecen como ramas curvas desde la cama evitando tocar paredes visibles, ahorran material y se retiran con facilidad sin dejar marcas profundas.',
                        'Hacen que la boquilla caliente más rápido.',
                        'Permiten imprimir sin filamento.',
                        'Aumentan el peso de la pieza un 300%.'
                    ],
                    correctIndex: 0,
                    explanation: 'Los soportes de árbol envuelven la pieza con ramas orgánicas mínimas, reduciendo el tiempo de laminado, el consumo de plástico y facilitando su remoción limpia.'
                }
            },
            {
                id: 'cu-3',
                unitIndex: 3,
                title: 'Adherencia a la Cama',
                fullTitle: 'Ajustes de Adherencia: Brim, Raft y Skirt',
                duration: '20 min',
                type: 'Adherencia',
                expReward: 25,
                summary: 'Estrategias contra el Warping: Skirt (Purga), Brim (Falda de agarre) y Raft (Balsa para superficies complejas).',
                sections: [
                    {
                        title: '1. Métodos de Fijación de la Primera Capa',
                        content: `
                            * **Skirt:** Líneas perimétricas que no tocan la pieza; sirven para cebar la boquilla y verificar el Z-Offset antes de comenzar.
                            * **Brim (Falda):** Anillo de $5-10\\,\\text{mm}$ unido al contorno exterior de la pieza; multiplica el área de contacto para evitar que las esquinas se levanten por contracción térmica (*Warping*).
                            * **Raft (Balsa):** Base de varias capas gruesas sobre la cual se imprime el modelo; ideal para modelos con base irregular o camas desniveladas.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué método de adherencia añade un borde plano unido al contorno de la pieza para evitar que las esquinas se despeguen (Warping)?',
                    options: [
                        'Brim (Falda)',
                        'Skirt',
                        'Infill Gyroid',
                        'Ironing'
                    ],
                    correctIndex: 0,
                    explanation: 'El Brim extiende la primera capa creando un anillo de anclaje de varios milímetros que sujeta las esquinas con firmeza a la placa calefactora.'
                }
            },
            {
                id: 'cu-4',
                unitIndex: 4,
                title: 'G-Code Optimizado',
                fullTitle: 'Generación y Guardado de G-Code Optimizado',
                duration: '15 min',
                type: 'G-Code',
                expReward: 25,
                summary: 'Previsualización por capas y líneas, análisis del mapa de velocidades, cálculo de tiempo de impresión y peso en gramos.',
                sections: [
                    {
                        title: '1. Inspección de Trayectorias G-Code',
                        content: `
                            Antes de guardar en la tarjeta SD o enviar por WiFi:
                            * Cambiar al modo **Preview** y deslizar la barra vertical para comprobar la primera capa y los puentes en el aire (*Bridging*).
                            * Comprobar la visualización por **Line Type** para confirmar que las costuras (*Z-Seams*) estén alineadas en una arista trasera no visible.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué información crítica debe revisarse en la vista de simulación de Cura antes de mandar a imprimir?',
                    options: [
                        'Que no existan capas en el aire sin soporte y que la primera capa esté completamente cerrada.',
                        'El color del cable de corriente.',
                        'El peso del computador.',
                        'El número de serie de la memoria USB.'
                    ],
                    correctIndex: 0,
                    explanation: 'La simulación capa a capa permite detectar voladizos flotando en el vacío antes de gastar material y tiempo en la máquina física.'
                }
            }
        ]
    },

    // ── RUTA 5: ORCASLICER ──
    'track-orcaslicer': {
        id: 'track-orcaslicer',
        title: 'OrcaSlicer',
        badge: 'Laminador Pro',
        level: 'Avanzado / Velocidad',
        color: '#10b981',
        pinId: 'pin-slicing',
        units: [
            {
                id: 'os-1',
                unitIndex: 1,
                title: 'Pressure Advance & Flujo',
                fullTitle: 'Pruebas Integradas de Flujo y Presión (Pressure Advance)',
                duration: '25 min',
                type: 'Calibración',
                expReward: 25,
                summary: 'Calibración de Pressure Advance / Linear Advance para esquinas sin abultamientos y prueba de caudal volumétrico máximo (Max Volumetric Speed).',
                sections: [
                    {
                        title: '1. Control Dinámico de Presión en Boquilla',
                        content: `
                            A velocidades de $300-500\\,\\text{mm/s}$, el plástico fundido actúa como un resorte elástico dentro del Hotend.
                            
                            * **Pressure Advance (PA):** Compensa la inercia del fluido desacelerando la extrusión antes de las esquinas y acelerándola al salir de la curva, eliminando esquinas redondeadas o abultadas.
                            * **Caudal Volumétrico ($mm^3/s$):** Define el límite físico de fusión del Hotend (ej. $15-20\\,\\text{mm}^3/s$ en Hotends estándar y $32\\,\\text{mm}^3/s$ en Hotends de alta velocidad CHT/Volcano).
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué defecto corrige la calibración de Pressure Advance (PA) en OrcaSlicer?',
                    options: [
                        'Esquinas abultadas con exceso de material y costuras sobredimensionadas a alta velocidad.',
                        'El color del filamento.',
                        'La nivelación del eje Z.',
                        'La tensión de la pantalla LCD.'
                    ],
                    correctIndex: 0,
                    explanation: 'Pressure Advance modula la presión del fundido en aceleraciones y frenadas, produciendo esquinas vivas de 90° limpias y nítidas.'
                }
            },
            {
                id: 'os-2',
                unitIndex: 2,
                title: 'Soportes Orgánicos',
                fullTitle: 'Soportes Orgánicos y Alturas de Capa Variables',
                duration: '25 min',
                type: 'Optimización',
                expReward: 25,
                summary: 'Alturas de capa adaptativas automáticas (Variable Layer Height) que suavizan cúpulas reduciendo la capa a 0.08mm y aceleran paredes verticales a 0.28mm.',
                sections: [
                    {
                        title: '1. Altura de Capa Adaptativa',
                        content: `
                            La función de **Variable Layer Height** analiza la curvatura topográfica del modelo:
                            * En paredes verticales rectas utiliza capas gruesas ($0.24-0.28\\,\\text{mm}$) para máxima velocidad.
                            * En techos curvos, esferas y cúpulas reduce automáticamente a capas ultra finas ($0.08-0.12\\,\\text{mm}$) para eliminar el efecto escalera (*Stair-stepping*).
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es la función principal de la altura de capa adaptativa (Adaptive Layer Height)?',
                    options: [
                        'Reducir el espesor de capa solo en zonas curvas y pendientes para suavizar el modelo sin aumentar excesivamente el tiempo en paredes verticales.',
                        'Hacer que la pieza sea hueca.',
                        'Apagar el extrusor a mitad de camino.',
                        'Cambiar de filamento automáticamente.'
                    ],
                    correctIndex: 0,
                    explanation: 'Optimiza el compromiso entre tiempo y resolución, aplicando capas finas solo donde la curvatura geométrica lo necesita.'
                }
            },
            {
                id: 'os-3',
                unitIndex: 3,
                title: 'Costuras & Velocidades',
                fullTitle: 'Alineación Automática de Costuras y Velocidades Dinámicas',
                duration: '30 min',
                type: 'Ajustes',
                expReward: 25,
                summary: 'Estrategias de costura Scarf Joint (costura biselada invisible), control de aceleración por línea y reducción de vibraciones por compensación de resonancia.',
                sections: [
                    {
                        title: '1. Costura Scarf Joint (Tecnología SIMI3D)',
                        content: `
                            * La costura tradicional deja un punto vertical visible donde inicia y termina cada lazo exterior.
                            * **Scarf Joint Seam:** Superpone el inicio y fin de capa mediante un biselado gradual con rampa de extrusión de $45^\\circ$, logrando costuras prácticamente invisibles al tacto y a la vista.
                        `
                    }
                ],
                quiz: {
                    question: '¿Cómo funciona la innovadora costura "Scarf Joint" en OrcaSlicer?',
                    options: [
                        'Superpone los extremos de la pared exterior mediante un empalme biselado en rampa suave para ocultar la costura.',
                        'Elimina los perímetros de la pieza.',
                        'Corta el filamento con una cuchilla interna.',
                        'Imprime la costura por fuera del modelo flotando en el aire.'
                    ],
                    correctIndex: 0,
                    explanation: 'El Scarf Joint traslapa los perímetros en ángulo gradual en lugar de un punto de parada brusco, haciendo la costura imperceptible.'
                }
            },
            {
                id: 'os-4',
                unitIndex: 4,
                title: 'Multi-Placa & Red',
                fullTitle: 'Control Multi-Placa y Conexión Directa WiFi',
                duration: '20 min',
                type: 'Flujo',
                expReward: 25,
                summary: 'Gestión de proyectos con múltiples bandejas de impresión (Multi-Plate), envío directo por protocolo Moonraker / Klipper y telemetría por cámara.',
                sections: [
                    {
                        title: '1. Producción por Lotes en el Semillero',
                        content: `
                            * Organiza todas las piezas de un robot o ensamble en un único archivo de proyecto **.3MF**.
                            * Distribuye componentes por platos temáticos (ejemplo: Plato 1: Estructura PLA negro, Plato 2: Engranajes PETG naranja, Plato 3: Ruedas TPU flexible).
                            * Envío directo por red a través de la interfaz web integrada de Klipper / OctoPrint.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué ventaja ofrece el formato de archivo de proyecto .3MF en OrcaSlicer frente a un archivo .STL clásico?',
                    options: [
                        'Guarda todas las geometrías, múltiples placas de impresión, ajustes de materiales, soportes y perfiles de velocidad en un solo paquete comprimido.',
                        'Ocupa 100 veces más espacio en el disco duro.',
                        'Solo puede abrirse en Windows 98.',
                        'Elimina los colores del modelo.'
                    ],
                    correctIndex: 0,
                    explanation: 'El estándar 3MF almacena la escena completa de manufactura aditiva con parámetros de corte, mallas y asignación de materiales por placa.'
                }
            }
        ]
    },

    // ── RUTA 6: PRUSASLICER ──
    'track-prusaslicer': {
        id: 'track-prusaslicer',
        title: 'PrusaSlicer',
        badge: 'Laminador Abierto',
        level: 'Intermedio / Avanzado',
        color: '#ea580c',
        pinId: 'pin-slicing',
        units: [
            {
                id: 'ps-1',
                unitIndex: 1,
                title: 'Corte & Conectores',
                fullTitle: 'Corte de Modelos, Clavijas de Unión y Conectores',
                duration: '20 min',
                type: 'Malla',
                expReward: 25,
                summary: 'Herramienta de corte planar en cualquier ángulo con generación automática de clavijas de encastre (Dowel Pins) y conectores macho-hembra para ensamblar piezas gigantes.',
                sections: [
                    {
                        title: '1. Impresión de Objetos Más Grandes que el Volumen de la Máquina',
                        content: `
                            La herramienta **Cut Tool** de PrusaSlicer permite seccionar modelos de gran envergadura:
                            * Permite definir un plano de corte con cualquier orientación en $X, Y, Z$.
                            * Añade automáticamente **clavijas de unión (Dowel Pins)** cilíndricas o prismáticas con holgura configurable ($0.15\\,\\text{mm}$) para un ensamblado y pegado milimétricamente alineado.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué función cumple la opción "Add Connectors" al cortar un modelo en PrusaSlicer?',
                    options: [
                        'Genera clavijas y agujeros de acople automático para alinear y pegar las partes seccionadas con precisión.',
                        'Añade cables eléctricos a la pieza.',
                        'Cambia la boquilla de la máquina.',
                        'Pinta la pieza con colores de camuflaje.'
                    ],
                    correctIndex: 0,
                    explanation: 'Los conectores generan espigas y cavidades coincidentes con tolerancias calculadas para ensamblar partes grandes con máxima resistencia mecánica.'
                }
            },
            {
                id: 'ps-2',
                unitIndex: 2,
                title: 'Pintado de Soportes',
                fullTitle: 'Pintado de Soportes Manuales y Bloqueadores',
                duration: '25 min',
                type: 'Soportes',
                expReward: 25,
                summary: 'Pintado interactivo con pincel para forzar soportes solo en voladizos críticos o colocar bloqueadores en roscas y agujeros pequeños.',
                sections: [
                    {
                        title: '1. Control Manual con Paint-on Supports',
                        content: `
                            * **Pincel Azul (Enforce Supports):** Obliga a generar soporte exclusivamente en las caras pintadas por el usuario.
                            * **Pincel Rojo (Block Supports):** Bloquea la generación de soportes en zonas donde no son necesarios (como orificios cilíndricos horizontales de hasta $10\\,\\text{mm}$ o roscas métricas).
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué es útil pintar bloqueadores de soporte (Block Supports) dentro de los agujeros roscados?',
                    options: [
                        'Para evitar que se llene de filamento de soporte difícil de extraer que estropearía el filete de la rosca.',
                        'Para que el tornillo entre más apretado.',
                        'Para aumentar el consumo de resina.',
                        'Para acelerar el giro de los motores.'
                    ],
                    correctIndex: 0,
                    explanation: 'Los orificios roscados pueden imprimirse en puente sin soportes; colocar un bloqueador evita que el laminador coloque material en los surcos de la rosca.'
                }
            },
            {
                id: 'ps-3',
                unitIndex: 3,
                title: 'Relleno Giroidal DFAM',
                fullTitle: 'Relleno Giroidal y Estructuras Livianas DFAM',
                duration: '25 min',
                type: 'Rellenos',
                expReward: 25,
                summary: 'Matemática del relleno Gyroid, ahorro de peso con máxima resistencia a la torsión y optimización de densidad según esfuerzos mecánicos.',
                sections: [
                    {
                        title: '1. Relleno Giroidal (Gyroid Infill)',
                        content: `
                            * A diferencia de los patrones de rejilla que cruzan líneas sobre el mismo plano provocando choques de boquilla, el **Gyroid** es una superficie mínima triplemente periódica continua.
                            * Posee idéntica resistencia a compresión y corte en todas las direcciones tridimensionales y permite la libre circulación de líquidos o resinas de relleno estructural.
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es una propiedad mecánica destacada del patrón de relleno Giroide (Gyroid)?',
                    options: [
                        'Es tridimensional e isotrópico, distribuyendo las fuerzas de manera uniforme en todas las direcciones sin colisiones de boquilla en los cruces de capa.',
                        'Es completamente hueco y no pesa nada.',
                        'Solo resiste en el eje Z.',
                        'Requiere pegamento líquido en cada capa.'
                    ],
                    correctIndex: 0,
                    explanation: 'El giroide ofrece una distribución uniforme de esfuerzos mecánicos sin acumulación de material en las intersecciones, evitando atascos o golpes a alta velocidad.'
                }
            },
            {
                id: 'ps-4',
                unitIndex: 4,
                title: 'Verificación de Capas',
                fullTitle: 'Exportación y Previsualización Capa a Capa',
                duration: '20 min',
                type: 'Verificación',
                expReward: 25,
                summary: 'Comprobación de tiempos de enfriamiento de capa, estimación del costo de material por gramo y exportación a G-Code estándar.',
                sections: [
                    {
                        title: '1. Métricas de Producción',
                        content: `
                            PrusaSlicer desglosa con exactitud matemática:
                            * Tiempo empleado en perímetros, rellenos sólidos, soportes y traslados rápidos.
                            * Masa consumida en gramos ($g$) y longitud en metros ($m$).
                            * Costo monetario exacto configurando el precio del kilogramo de filamento en las preferencias de filamento.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué permite verificar el control deslizante horizontal inferior en la vista de previsualización de PrusaSlicer?',
                    options: [
                        'El orden y sentido exacto de los movimientos del cabezal de impresión a lo largo de una capa individual.',
                        'El volumen de la música de fondo.',
                        'El brillo de la pantalla del computador.',
                        'La velocidad de la conexión a internet.'
                    ],
                    correctIndex: 0,
                    explanation: 'La barra horizontal simula paso a paso la trayectoria del nozzle dentro de la capa seleccionada, mostrando el orden de los perímetros, retracciones y traslados.'
                }
            }
        ]
    }
};
