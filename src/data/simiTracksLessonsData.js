// ==========================================================================
// SIMI_TRACKS_LESSONS_DATA: Contenido Educativo Completo de las 8 Rutas SIMI3D
// ==========================================================================

import { SIMI_CAD_LESSONS_DATA } from './simiCadLessonsData';
import { SIMI_SLICERS_LESSONS_DATA } from './simiSlicersLessonsData';

export const SIMI_TRACKS_LESSONS_DATA = {
    // ── RUTAS CAD (Tinkercad, Blender, Fusion 360) ──
    ...SIMI_CAD_LESSONS_DATA,

    // ── RUTAS SLICERS (Cura, OrcaSlicer, PrusaSlicer) ──
    ...SIMI_SLICERS_LESSONS_DATA,

    // ── RUTA 7: IMPRESIÓN 3D FDM / FFF (Termoplásticos y Taller) ──
    'track-fdm': {
        id: 'track-fdm',
        title: 'Impresión 3D FDM / FFF',
        badge: 'Hardware FDM',
        level: 'Práctico en Taller',
        color: '#eab308',
        pinId: 'pin-fdm',
        units: [
            {
                id: 'fdm-0',
                unitIndex: 1,
                title: 'Hardware & Cinemática',
                duration: '30 min',
                type: 'Fundamentos de Hardware',
                expReward: 25,
                summary: 'Cómo funciona la tecnología FDM/FFF, cinemáticas (Cartesiana vs CoreXY vs Delta), extrusor Directo vs Bowden y motores paso a paso.',
                sections: [
                    {
                        title: '1. ¿Qué es la Impresión FDM/FFF y cómo funciona?',
                        imageUrl: '', // Espacio listo para foto de impresora 3D FDM en funcionamiento
                        imageCaption: 'Fig 1.1: Principio de manufactura aditiva: adición de termoplástico fundido capa por capa.',
                        content: `
                            La tecnología **FDM (Fused Deposition Modeling)** o **FFF (Fused Filament Fabrication)** es un proceso de manufactura aditiva donde un filamento termoplástico continuo de $1.75\\,\\text{mm}$ o $2.85\\,\\text{mm}$ es traccionado por un extrusor hacia un bloque calefactor (**Hotend**).
                            
                            El polímero se funde a temperaturas entre $190^\\circ\\text{C}$ y $300^\\circ\\text{C}$, siendo forzado a través de una boquilla calibrada (habitualmente de $0.4\\,\\text{mm}$) y depositado sobre una plataforma de construcción (**Cama caliente**) siguiendo coordenadas tridimensionales $(X, Y, Z)$ dictadas por el código numérico (**G-Code**).
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 190" width="100%" height="180" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">🔄 Ciclo Operativo Fundamental de una Impresora FDM</text>
                                
                                <!-- Paso 1: Tracción -->
                                <g transform="translate(40, 45)">
                                    <rect x="0" y="0" width="140" height="95" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
                                    <text x="70" y="25" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">1. Extrusor</text>
                                    <circle cx="55" cy="55" r="14" fill="#334155" stroke="#94a3b8"/>
                                    <circle cx="85" cy="55" r="14" fill="#334155" stroke="#94a3b8"/>
                                    <line x1="70" y1="35" x2="70" y2="80" stroke="#f59e0b" stroke-width="3"/>
                                    <text x="70" y="115" fill="#94a3b8" font-size="10" text-anchor="middle">Engranajes de empuje</text>
                                </g>

                                <text x="200" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Paso 2: Fusión -->
                                <g transform="translate(230, 45)">
                                    <rect x="0" y="0" width="140" height="95" rx="6" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
                                    <text x="70" y="25" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">2. Hotend Térmico</text>
                                    <rect x="50" y="38" width="40" height="28" rx="2" fill="#dc2626"/>
                                    <polygon points="60,66 80,66 74,80 66,80" fill="#eab308"/>
                                    <text x="70" y="56" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">200°C+</text>
                                    <text x="70" y="115" fill="#94a3b8" font-size="10" text-anchor="middle">Licuado de polímero</text>
                                </g>

                                <text x="390" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Paso 3: Deposición Capa a Capa -->
                                <g transform="translate(420, 45)">
                                    <rect x="0" y="0" width="140" height="95" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="70" y="25" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">3. Deposición Capa</text>
                                    <line x1="20" y1="75" x2="120" y2="75" stroke="#38bdf8" stroke-width="3"/>
                                    <rect x="40" y="65" width="60" height="8" rx="2" fill="#10b981"/>
                                    <rect x="50" y="55" width="40" height="8" rx="2" fill="#10b981" opacity="0.8"/>
                                    <text x="70" y="115" fill="#94a3b8" font-size="10" text-anchor="middle">Cama a 60°C</text>
                                </g>

                                <text x="580" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Paso 4: Solidificación -->
                                <g transform="translate(605, 45)">
                                    <rect x="0" y="0" width="125" height="95" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5"/>
                                    <text x="62" y="25" fill="#06b6d4" font-size="11" font-weight="bold" text-anchor="middle">4. Solidificación</text>
                                    <text x="62" y="55" fill="#f8fafc" font-size="10" text-anchor="middle">Ventilador de Capa</text>
                                    <text x="62" y="72" fill="#38bdf8" font-size="9" text-anchor="middle">❄️ Enfriamiento</text>
                                    <text x="62" y="115" fill="#94a3b8" font-size="10" text-anchor="middle">Cristalización rápida</text>
                                </g>
                            </svg>
                        `
                    },
                    {
                        title: '2. Cinemáticas y Tipos de Impresoras 3D FDM',
                        imageUrl: '', // Espacio listo para imagen comparativa de estructuras (Bedslinger vs CoreXY)
                        imageCaption: 'Fig 1.2: Comparativa estructural de cinemáticas en el taller.',
                        content: `
                            La forma en que los motores mueven los componentes define la velocidad, masa inercial y precisión de la máquina:
                            
                            1. **Cartesiana Clásica (Cama Móvil / "Bedslinger"):**
                               * **Movimiento:** El cabezal se mueve en $X$ y sube en $Z$, mientras que la **cama caliente se desplaza hacia adelante y atrás en el eje $Y$**.
                               * **Ventajas:** Mecánica sencilla, económica de fabricar y mantener.
                               * **Desventajas:** La masa de la cama genera inercia a altas velocidades ($>100\\,\\text{mm/s}$), provocando vibraciones (*ghosting/ringing*).
                               * *Ejemplos:* Creality Ender 3, Prusa MK3/MK4, Anycubic Kobra.
                            
                            2. **CoreXY (Cubo Cerrado / Alta Velocidad):**
                               * **Movimiento:** Dos motores estacionarios fijos mueven el cabezal en $X$ e $Y$ mediante un sistema de correas cruzadas simultáneas. **La cama solo baja lentamente en el eje $Z$**.
                               * **Ventajas:** Cabezal ultra liviano, aceleraciones brutales ($>10\\,000\\,\\text{mm/s}^2$) y velocidades de $300$ a $600\\,\\text{mm/s}$ sin perder precisión.
                               * *Ejemplos:* Bambu Lab X1/P1P, Creality K1, Voron 2.4/Trident.
                            
                            3. **Delta (Brazos Articulados Paralelos):**
                               * **Movimiento:** 3 columnas verticales con brazos que convergen en el cabezal. La cama permanece fija.
                               * **Ventajas:** Excelente para piezas cilíndricas y muy altas, velocidad elevada en $Z$.
                               * *Ejemplos:* FLSUN V400 / S1.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 185" width="100%" height="175" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="185" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">📐 Comparativa Cinemática: Cartesiana vs CoreXY</text>
                                
                                <!-- Cartesiana -->
                                <g transform="translate(60, 45)">
                                    <rect x="0" y="0" width="280" height="115" rx="6" fill="#1e293b" stroke="#64748b"/>
                                    <text x="140" y="22" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">Cartesiana (Bedslinger)</text>
                                    <text x="140" y="44" fill="#f8fafc" font-size="11" text-anchor="middle">Cabezal: Eje X | Cama: Eje Y (Móvil)</text>
                                    <text x="140" y="66" fill="#94a3b8" font-size="10.5" text-anchor="middle">⚠️ Mayor inercia en Y por peso de la cama</text>
                                    <text x="140" y="92" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">Velocidad estándar: 50 – 100 mm/s</text>
                                </g>

                                <!-- CoreXY -->
                                <g transform="translate(420, 45)">
                                    <rect x="0" y="0" width="280" height="115" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="140" y="22" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">CoreXY (Gantry Rápido)</text>
                                    <text x="140" y="44" fill="#f8fafc" font-size="11" text-anchor="middle">Cabezal: X + Y | Cama: Solo Z</text>
                                    <text x="140" y="66" fill="#94a3b8" font-size="10.5" text-anchor="middle">✓ Motores fijos en chasis / Cero inercia</text>
                                    <text x="140" y="92" fill="#10b981" font-size="10" font-weight="600" text-anchor="middle">Velocidad profesional: 250 – 500+ mm/s</text>
                                </g>
                            </svg>
                        `
                    },
                    {
                        title: '3. Sistema de Extrusión: ¿Extrusor Directo o Bowden?',
                        content: `
                            El método de transporte del filamento influye directamente en los materiales que la máquina puede procesar:
                            
                            * **Extrusor Directo (Direct Drive):** El motor del extrusor está montado directamente encima del cabezal de impresión.
                              * *Ventajas:* Excelente control de retracciones ($0.5-1.5\\,\\text{mm}$), **imprescindible para filamentos flexibles (TPU)**.
                              * *Desventajas:* Añade masa al cabezal móvil en cartesianas.
                            * **Sistema Bowden:** El motor está fijo en el chasis y empuja el filamento a través de un tubo de teflón (PTFE) hacia el Hotend.
                              * *Ventajas:* Cabezal liviano.
                              * *Desventajas:* Requiere retracciones largas ($4-7\\,\\text{mm}$), propenso a hilos (*stringing*) y muy difícil para imprimir TPU blando.
                        `,
                        callout: {
                            type: 'info',
                            title: 'Equipamiento SIMI3D',
                            text: 'En el Semillero SIMI3D recomendamos extrusores directos con doble engranaje de acero endurecido (Dual Gear) para garantizar tracción uniforme tanto en filamentos técnicos rígidos (PETG-CF) como en elastómeros flexibles (TPU 95A / 85A).'
                        }
                    }
                ],
                quiz: {
                    question: '¿Cuál es la principal ventaja de la cinemática CoreXY frente a una impresora cartesiana tradicional tipo "Bedslinger"?',
                    options: [
                        'No utiliza correas dentadas.',
                        'Los motores de X e Y están fijos en el chasis y la cama no se desplaza en el plano horizontal, reduciendo drásticamente la masa en movimiento y permitiendo velocidades muy altas.',
                        'No necesita calentar la cama de impresión.',
                        'Solo puede imprimir modelos de tamaño miniatura.'
                    ],
                    correctIndex: 1,
                    explanation: 'Al mantener los motores fijos en la estructura y hacer que la cama solo baje en Z, el cabezal es sumamente liviano, eliminando la inercia del peso de la cama móvil y evitando el ringing o efecto fantasma a alta velocidad.'
                }
            },
            {
                id: 'fdm-1',
                unitIndex: 2,
                title: 'Nivelación & Z-Offset',
                duration: '25 min',
                type: 'Taller Práctico',
                expReward: 25,
                summary: 'Dominio de la física de adherencia de la primera capa, calibración manual con galga y nivelación automática por malla.',
                sections: [
                    {
                        title: '1. La Física de la Primera Capa y la Altura Z',
                        content: `
                            La primera capa es el cimiento estructural de toda pieza impresa por **FDM (Fused Deposition Modeling)**. Un error de apenas **$0.05\\,\\text{mm}$** en el eje $Z$ puede significar la diferencia entre una pieza con adhesión perfecta o un fallo catastrófico (desprendimiento o *warping*).
                            
                            * **Z-Offset Demasiado Alto:** El filamento extruido cae en forma cilíndrica sin aplastarse contra la cama. No hay área de contacto suficiente y la pieza se despega durante el movimiento rápido.
                            * **Z-Offset Correcto (Squish Óptimo):** La boquilla aplasta el cordón fundido generando una sección ovalada con solapamiento perfecto del $100\\%$ entre líneas adyacentes, sin crestas laterales.
                            * **Z-Offset Demasiado Bajo:** La boquilla roza la placa, impidiendo la salida del plástico. Esto genera sobrepresión en el extrusor (*clogging*), saltos en el motor paso a paso (*clicking*) y posibles rayones en la superficie PEI.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 210" width="100%" height="200" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <!-- Fondo General -->
                                <rect width="760" height="210" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                
                                <!-- CASO 1: Z-Offset Alto (Malo) -->
                                <g transform="translate(40, 20)">
                                    <text x="90" y="20" fill="#f43f5e" font-size="13" font-weight="bold" text-anchor="middle">❌ Z-Offset Alto</text>
                                    <text x="90" y="38" fill="#94a3b8" font-size="10.5" text-anchor="middle">Filamento redondo / Sin adhesión</text>
                                    <!-- Nozzle -->
                                    <polygon points="70,55 110,55 98,90 82,90" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                    <!-- Cama PEI -->
                                    <line x1="10" y1="140" x2="170" y2="140" stroke="#38bdf8" stroke-width="4"/>
                                    <!-- Cordón redondo -->
                                    <circle cx="90" cy="126" r="14" fill="#f43f5e" opacity="0.85" stroke="#ffe4e6" stroke-width="1.5"/>
                                    <text x="90" y="170" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">Desprendimiento</text>
                                </g>

                                <!-- CASO 2: Z-Offset Óptimo (Correcto) -->
                                <g transform="translate(285, 20)">
                                    <text x="90" y="20" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">✓ Squish Óptimo (SIMI3D)</text>
                                    <text x="90" y="38" fill="#94a3b8" font-size="10.5" text-anchor="middle">Aplastamiento 120% / Soldadura 100%</text>
                                    <!-- Nozzle -->
                                    <polygon points="70,68 110,68 98,103 82,103" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                    <!-- Cama PEI -->
                                    <line x1="10" y1="140" x2="170" y2="140" stroke="#38bdf8" stroke-width="4"/>
                                    <!-- Cordón ovalado perfecto -->
                                    <rect x="62" y="118" width="56" height="22" rx="11" fill="#10b981" opacity="0.9" stroke="#d1fae5" stroke-width="1.5"/>
                                    <text x="90" y="170" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Adhesión Máxima</text>
                                </g>

                                <!-- CASO 3: Z-Offset Bajo (Malo) -->
                                <g transform="translate(530, 20)">
                                    <text x="90" y="20" fill="#f43f5e" font-size="13" font-weight="bold" text-anchor="middle">❌ Z-Offset Demasiado Bajo</text>
                                    <text x="90" y="38" fill="#94a3b8" font-size="10.5" text-anchor="middle">Boquilla raspa / Atasco de extrusor</text>
                                    <!-- Nozzle pegado a cama -->
                                    <polygon points="70,88 110,88 98,123 82,123" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                    <!-- Cama PEI -->
                                    <line x1="10" y1="140" x2="170" y2="140" stroke="#38bdf8" stroke-width="4"/>
                                    <!-- Plástico aplastado casi invisible con rebaba -->
                                    <path d="M 50,136 Q 90,138 130,136 Q 135,133 140,136 Q 90,141 40,136 Z" fill="#f43f5e" stroke="#f43f5e"/>
                                    <text x="90" y="170" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">Atasco / Rayón PEI</text>
                                </g>
                            </svg>
                        `,
                        callout: {
                            type: 'tip',
                            title: 'Regla del Taller SIMI3D',
                            text: 'El cordón de la primera capa debe tener un ancho de línea aproximado del 120% del diámetro del nozzle (ej. 0.48 mm para un nozzle de 0.4 mm) y una altura uniforme del 50% al 75% de la boquilla.'
                        }
                    },
                    {
                        title: '2. Nivelación Manual de 4 Puntos vs Nivelación Automática (Auto-Bed Leveling)',
                        content: `
                            1. **Nivelación Manual (Prueba del Papel / Galga 0.10 mm):**
                               * Con la cama caliente a temperatura de trabajo ($60^\\circ\\text{C}$ para PLA), se ajustan las cuatro ruedas moleteadas inferiores en las esquinas.
                               * Se desliza una hoja de papel de $80\\,\\text{g/m}^2$; debe sentirse una ligera fricción táctil al moverla hacia adelante y atrás sin rasgarla.
                            2. **Nivelación por Malla (Mesh Bed Leveling / CR-Touch / BLTouch):**
                               * El sensor mide una matriz de $3\\times3$, $4\\times4$ o $5\\times5$ puntos sobre la plataforma.
                               * El firmware crea un mapa tridimensional de desniveles de la placa y compensa en tiempo real el micromovimiento del eje $Z$ en las primeras $10$ capas.
                        `
                    },
                    {
                        title: '3. Procedimiento Práctico de Calibración Paso a Paso',
                        steps: [
                            'Limpiar la placa PEI con Alcohol Isopropílico al 99% para eliminar grasas dactilares.',
                            'Precalentar la boquilla a 150°C (sin gotear) y la cama a 60°C.',
                            'Ejecutar Auto-Home (G28) y realizar el escaneo de nivelación de malla (G29 o Bed Tramming).',
                            'Imprimir un archivo de prueba de 5 cuadros de calibración de 0.20 mm de espesor.',
                            'Ajustar el Z-Offset en tiempo real desde la pantalla de la máquina (Baby-stepping de 0.02 mm).'
                        ]
                    }
                ],
                quiz: {
                    question: '¿Qué síntoma indica que el Z-Offset está demasiado bajo durante la impresión de la primera capa?',
                    options: [
                        'Líneas sueltas que se despegan con solo tocarlas con el dedo.',
                        'El extrusor hace clics de salto de pasos y el plástico sale transparente o bloqueado contra la cama.',
                        'La boquilla gotea filamento antes de empezar a imprimir.',
                        'La pieza se despega a los 10 minutos de haber iniciado la impresión.'
                    ],
                    correctIndex: 1,
                    explanation: 'Cuando la boquilla está excesivamente pegada a la cama, la presión impide la salida del termoplástico fundido, forzando al motor del extrusor a saltar pasos (sonido metálico "tac-tac") y dejando surcos transparentes.'
                }
            },
            {
                id: 'fdm-2',
                unitIndex: 3,
                title: 'Filamentos & Térmica',
                duration: '30 min',
                type: 'Ciencia de Materiales',
                expReward: 25,
                summary: 'Propiedades reológicas, temperatura de transición vítrea (Tg), rangos de extrusión, higroscopía y ventilación de capa.',
                sections: [
                    {
                        title: '1. Comparativa de Termoplásticos para Prototipado',
                        content: `
                            Cada material de impresión tiene un comportamiento molecular específico que determina su resistencia mecánica, térmica y química:
                        `,
                        table: {
                            headers: ['Material', 'Temp. Nozzle', 'Temp. Cama', 'Ventilación', 'Características & Aplicaciones'],
                            rows: [
                                ['PLA / PLA+', '195°C – 215°C', '50°C – 60°C', '100% (Máxima)', 'Fácil de imprimir, alta rigidez, baja contracción. Ideal para modelos visuales y carcasas sin carga térmica.'],
                                ['PETG Industrial', '230°C – 245°C', '75°C – 85°C', '20% – 50%', 'Excelente resistencia al impacto, flexible ante fatiga, resistente a químicos y rayos UV. Ideal para piezas mecánicas.'],
                                ['ABS / ASA', '240°C – 260°C', '95°C – 110°C', '0% (Apagada)', 'Alta resistencia térmica (Tg ≈ 105°C), mecanizable. Requiere cabina cerrada para evitar warping y delaminación.'],
                                ['TPU (Shore 95A)', '220°C – 235°C', '40°C – 60°C', '40% – 80%', 'Elastómero flexible, absorbe vibraciones e impactos. Requiere velocidades lentas (20-35 mm/s) y extrusor directo.']
                            ]
                        },
                        svgDiagram: `
                            <svg viewBox="0 0 760 190" width="100%" height="180" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <!-- Gráfico de Termoplásticos: Temperatura vs Resistencia Térmica -->
                                <text x="380" y="24" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">🔥 Matriz Térmica & Transición Vítrea (Tg)</text>
                                
                                <!-- Barras comparativas -->
                                <!-- PLA -->
                                <g transform="translate(40, 45)">
                                    <text x="0" y="18" fill="#10b981" font-size="12" font-weight="bold">PLA / PLA+</text>
                                    <rect x="110" y="5" width="220" height="18" rx="4" fill="#10b981" opacity="0.85"/>
                                    <text x="120" y="18" fill="#ffffff" font-size="10.5" font-weight="600">Extrusión: 200°C | Cama: 60°C</text>
                                    <rect x="340" y="5" width="110" height="18" rx="4" fill="#059669"/>
                                    <text x="348" y="18" fill="#ffffff" font-size="10">Tg ≈ 55°C</text>
                                </g>

                                <!-- PETG -->
                                <g transform="translate(40, 78)">
                                    <text x="0" y="18" fill="#06b6d4" font-size="12" font-weight="bold">PETG</text>
                                    <rect x="110" y="5" width="270" height="18" rx="4" fill="#06b6d4" opacity="0.85"/>
                                    <text x="120" y="18" fill="#ffffff" font-size="10.5" font-weight="600">Extrusión: 235°C | Cama: 80°C</text>
                                    <rect x="390" y="5" width="150" height="18" rx="4" fill="#0891b2"/>
                                    <text x="398" y="18" fill="#ffffff" font-size="10">Tg ≈ 80°C</text>
                                </g>

                                <!-- ABS -->
                                <g transform="translate(40, 111)">
                                    <text x="0" y="18" fill="#f43f5e" font-size="12" font-weight="bold">ABS / ASA</text>
                                    <rect x="110" y="5" width="310" height="18" rx="4" fill="#f43f5e" opacity="0.85"/>
                                    <text x="120" y="18" fill="#ffffff" font-size="10.5" font-weight="600">Extrusión: 250°C | Cama: 105°C</text>
                                    <rect x="430" y="5" width="200" height="18" rx="4" fill="#e11d48"/>
                                    <text x="438" y="18" fill="#ffffff" font-size="10">Tg ≈ 105°C (Requiere Cabina)</text>
                                </g>

                                <!-- Leyenda inferior -->
                                <text x="380" y="172" fill="#94a3b8" font-size="10.5" text-anchor="middle">💡 A mayor Tg, mayor resistencia al calor en servicio antes de reblandecerse la pieza.</text>
                            </svg>
                        `
                    },
                    {
                        title: '2. Higroscopía y Secado de Filamentos',
                        imageUrl: '', // Espacio listo para URL de imagen de filamento húmedo vs seco
                        imageCaption: 'Fig 2.1: Comparativa de acabado superficial y burbujas por humedad atrapada en el filamento.',
                        content: `
                            Polímeros como el **PETG, TPU y Nylon** son altamente higroscópicos: absorben humedad del ambiente en cuestión de horas.
                            
                            * **Efectos de la humedad:** El agua acumulada hierve instantáneamente al pasar por el Hotend a $230^\\circ\\text{C}$, produciendo microexplosiones de vapor (*popping/crackling*), exceso de hilos (*stringing*), superficie rugosa y fragilidad interlaminar.
                            * **Solución de Taller:** Almacenar en cajas herméticas con silica gel y secar en horno de filamento a $50^\\circ\\text{C}-65^\\circ\\text{C}$ durante $4-6$ horas antes de imprimir.
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué debe apagarse o reducirse al mínimo el ventilador de capa al imprimir con ABS o ASA?',
                    options: [
                        'Para ahorrar energía eléctrica en la impresora 3D.',
                        'Porque el enfriamiento brusco por aire provoca contracción térmica violenta, rajando las capas entre sí (delaminación/warping).',
                        'Porque el ventilador de capa apaga la resistencia del Hotend.',
                        'Para que el plástico salga con acabado brillante tipo espejo.'
                    ],
                    correctIndex: 1,
                    explanation: 'El ABS tiene un coeficiente de dilatación térmica elevado. Si se enfría de golpe con el ventilador de capa, las capas superiores se encogen más rápido que las inferiores, partiéndose y despegándose de la cama.'
                }
            },
            {
                id: 'fdm-3',
                unitIndex: 4,
                title: 'Atascos & Boquillas',
                duration: '35 min',
                type: 'Mantenimiento Avanzado',
                expReward: 25,
                summary: 'Técnica de tirón en frío (Cold Pull), selección de materiales de boquillas y sintonización de control PID.',
                sections: [
                    {
                        title: '1. Anatomía del Hotend y Tipos de Boquillas',
                        imageUrl: '', // Espacio listo para diagrama o foto de Hotend y boquillas
                        imageCaption: 'Fig 3.1: Sección transversal del Hotend: Disipador, Heatbreak, Bloque Calefactor y Boquilla.',
                        content: `
                            * **Latón (Brass):** Máxima conductividad térmica, bajo costo. Ideal para PLA, PETG, TPU. Se desgasta rápidamente con filamentos abrasivos (fibra de carbono, madera, glow-in-the-dark).
                            * **Acero Templado (Hardened Steel):** Dureza superficial extrema ($>60\\,\\text{HRC}$). Resiste filamentos abrasivos. Requiere subir entre $5^\\circ\\text{C}-10^\\circ\\text{C}$ la temperatura por menor conductividad térmica.
                            * **Punta de Rubí / Carburo de Tungsteno:** Lo mejor de ambos mundos (conducción de cobre con punta impenetrable).
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 170" width="100%" height="160" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="170" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">⚙️ Anatomía del Flujo Térmico en Hotend</text>
                                
                                <!-- Disipador Frío -->
                                <g transform="translate(180, 45)">
                                    <rect x="0" y="0" width="110" height="40" rx="4" fill="#334155" stroke="#64748b"/>
                                    <text x="55" y="24" fill="#93c5fd" font-size="11" font-weight="bold" text-anchor="middle">Zona Fría (&lt;50°C)</text>
                                </g>
                                
                                <!-- Heatbreak (Garganta) -->
                                <g transform="translate(300, 52)">
                                    <rect x="0" y="0" width="50" height="26" rx="2" fill="#64748b" stroke="#94a3b8"/>
                                    <text x="25" y="17" fill="#f1f5f9" font-size="9" text-anchor="middle">Heatbreak</text>
                                </g>

                                <!-- Bloque Caliente -->
                                <g transform="translate(360, 40)">
                                    <rect x="0" y="0" width="100" height="50" rx="4" fill="#dc2626" opacity="0.9"/>
                                    <text x="50" y="28" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Bloque 200°C+</text>
                                    <text x="50" y="42" fill="#fecaca" font-size="9" text-anchor="middle">Cartucho + Termistor</text>
                                </g>

                                <!-- Boquilla Nozzle -->
                                <g transform="translate(470, 48)">
                                    <polygon points="0,0 35,0 45,17 35,34 0,34" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                    <text x="18" y="21" fill="#78350f" font-size="10" font-weight="bold" text-anchor="middle">Nozzle</text>
                                </g>

                                <text x="380" y="145" fill="#94a3b8" font-size="10.5" text-anchor="middle">💡 La rotura de puente térmico (Heat Creep) ocurre cuando el ventilador de la zona fría falla.</text>
                            </svg>
                        `
                    },
                    {
                        title: '2. Procedimiento de Desatasco "Cold Pull" (Atomic Pull)',
                        steps: [
                            'Calentar el Hotend a 230°C con un trozo de filamento de Nylon o PLA blanco.',
                            'Empujar el filamento manualmente hasta que salga un hilo limpio por la punta.',
                            'Dejar enfriar el Hotend hasta 90°C (PLA) o 130°C (Nylon).',
                            'Tirar firmemente del filamento hacia arriba con un movimiento constante.',
                            'Inspeccionar la punta extraída: debe verse el molde cónico exacto del interior del nozzle atrapando todo residuo quemado.'
                        ]
                    },
                    {
                        title: '3. Calibración PID (Proporcional - Integral - Derivativo)',
                        content: `
                            El control PID mantiene la temperatura de la boquilla estable dentro de $\\pm 0.5^\\circ\\text{C}$. Si la temperatura oscila violentamente $\\pm 5^\\circ\\text{C}$, se generan bandas horizontales visibles en la pieza.
                            
                            * Comando G-Code de sintonización para Hotend a $210^\\circ\\text{C}$ con $8$ ciclos:
                            \`\`\`gcode
                            M303 E0 S210 C8
                            M500 ; Guardar constantes Kp, Ki, Kd en la EEPROM
                            \`\`\`
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es el objetivo principal del procedimiento "Cold Pull" (Tirón en frío)?',
                    options: [
                        'Enfriar la placa de impresión rápidamente.',
                        'Limpiar el interior de la garganta y boquilla extrayendo los residuos carbonizados adheridos al filamento semi-sólido.',
                        'Ajustar la tensión de la correa del eje X.',
                        'Comprobar la velocidad máxima del ventilador.'
                    ],
                    correctIndex: 1,
                    explanation: 'Al dejar enfriar el filamento a una temperatura semi-sólida (~90°C para PLA) y tirar de él, el polímero actúa como un molde que arrastra toda partícula quemada o residuo metálico atascado dentro del nozzle.'
                }
            },
            {
                id: 'fdm-4',
                unitIndex: 5,
                title: 'Insertos & DFAM',
                duration: '30 min',
                type: 'Post-Proceso & Ensamble',
                expReward: 25,
                summary: 'Técnicas de ensamble profesional con tuercas de latón termofusionadas, tolerancias DFAM y uniones mecánicas.',
                sections: [
                    {
                        title: '1. Inserciones Roscadas de Latón (Heat-Set Threaded Inserts)',
                        imageUrl: '', // Espacio listo para URL de imagen del proceso con cautín
                        imageCaption: 'Fig 4.1: Instalación de inserto roscado de latón M3 con punta cónica para cautín térmico.',
                        content: `
                            Los tornillos enroscados directamente sobre plástico impreso se desgastan y barren tras $2-3$ ciclos de ajuste. Para ensambles profesionales de robótica e ingeniería, la norma industrial es utilizar **tuercas moleteadas de latón insertadas por calor (M2, M3, M4)**.
                            
                            * **Diseño del agujero en CAD:** Diseñar un orificio cilíndrico con un diámetro interior ligeramente menor que el diámetro exterior del moleteado (ejemplo: para inserto M3 con exterior de $4.6\\,\\text{mm}$, diseñar agujero de $4.2\\,\\text{mm}$ con chaflán guía de $45^\\circ$).
                            * **Proceso de inserción:**
                              1. Colocar el inserto sobre el agujero de la pieza impresa.
                              2. Ajustar el cautín a $200^\\circ\\text{C}-220^\\circ\\text{C}$ (para PLA/PETG).
                              3. Presionar suave y perpendicularmente con la punta cónica hasta que el plástico se funda alrededor del moleteado helicoidal.
                              4. Retirar el cautín y dejar solidificar 30 segundos sin mover la pieza.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 175" width="100%" height="165" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="175" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">🔩 Proceso de Termofusión de Inserto Roscado M3</text>
                                
                                <!-- Paso 1: Posicionado -->
                                <g transform="translate(60, 40)">
                                    <text x="60" y="16" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">1. Posicionado</text>
                                    <rect x="20" y="60" width="80" height="45" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
                                    <rect x="42" y="60" width="36" height="28" fill="#0f172a"/>
                                    <!-- Inserto latón arriba -->
                                    <rect x="44" y="32" width="32" height="24" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                </g>

                                <!-- Flecha -->
                                <text x="220" y="90" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Paso 2: Cautín calienta y empuja -->
                                <g transform="translate(270, 40)">
                                    <text x="60" y="16" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">2. Fusión (210°C)</text>
                                    <rect x="20" y="60" width="80" height="45" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
                                    <!-- Punta cautín -->
                                    <polygon points="50,15 70,15 63,55 57,55" fill="#f43f5e" stroke="#e11d48"/>
                                    <!-- Inserto hundiéndose -->
                                    <rect x="44" y="55" width="32" height="24" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
                                </g>

                                <!-- Flecha -->
                                <text x="430" y="90" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Paso 3: A ras y fijación permanente -->
                                <g transform="translate(480, 40)">
                                    <text x="60" y="16" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">3. A Ras y Frío</text>
                                    <rect x="20" y="60" width="80" height="45" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <!-- Inserto integrado a ras -->
                                    <rect x="44" y="60" width="32" height="24" rx="2" fill="#10b981" opacity="0.9" stroke="#059669" stroke-width="1.5"/>
                                    <text x="60" y="76" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">M3</text>
                                </g>

                                <text x="380" y="155" fill="#94a3b8" font-size="10.5" text-anchor="middle">💡 Deja enfriar 30s para que el polímero cristalice alrededor de las ranuras del moleteado.</text>
                            </svg>
                        `
                    },
                    {
                        title: '2. Tolerancias Mecánicas de Diseño para Manufactura Aditiva (DFAM)',
                        content: `
                            * **Encastre con Juego Libre (Ejes giratorios / pasadores):** Holgura diametral de **$+0.30\\,\\text{mm}$ a $+0.40\\,\\text{mm}$**.
                            * **Encastre por Deslizamiento Suave (Tapas / Guías):** Holgura de **$+0.20\\,\\text{mm}$**.
                            * **Encastre a Presión (Press-fit / Rodamientos 608ZZ):** Holgura de **$+0.05\\,\\text{mm}$ a $+0.10\\,\\text{mm}$**.
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué se prefiere usar insertos roscados de latón por calor en lugar de atornillar directamente sobre el plástico impreso?',
                    options: [
                        'Porque el tornillo directo en plástico se desgasta, pierde el filete de rosca y se barre con facilidad al desmontarlo.',
                        'Porque el latón hace que la pieza pese el doble.',
                        'Porque los tornillos de acero derriten el plástico a temperatura ambiente.',
                        'Porque el software de laminado no permite agujeros sin insertos.'
                    ],
                    correctIndex: 0,
                    explanation: 'El plástico termoplástico carece de la dureza del metal. El inserto de latón distribuye la carga mecánica mediante su moleteado exterior y permite montar y desmontar el tornillo cientos de veces sin sufrir holguras.'
                }
            }
        ]
    },

    // ── RUTA 7: MANUFACTURA EN RESINA SLA / MSLA (Química y Precisión) ──
    'track-sla': {
        id: 'track-sla',
        title: 'Manufactura en Resina SLA / MSLA',
        badge: 'Hardware SLA',
        level: 'Alta Precisión / Química',
        color: '#8b5cf6',
        pinId: 'pin-sla',
        units: [
            {
                id: 'sla-0',
                unitIndex: 1,
                title: 'Hardware MSLA & Óptica',
                duration: '25 min',
                type: 'Fundamentos Ópticos y Hardware',
                expReward: 25,
                summary: 'Principio de fotopolimerización por luz ultravioleta (405nm), diferencias entre SLA láser, DLP y MSLA (LCD Monocromo), y componentes de la cuba de resina.',
                sections: [
                    {
                        title: '1. Principio de la Fotopolimerización en Cuba (Vat Photopolymerization)',
                        imageCaption: 'Fig 1.1: Polimerización de resina líquida mediante luz UV a 405nm capa por capa.',
                        content: `
                            A diferencia de la tecnología FDM que funde plástico sólido, la impresión **SLA (Stereolithography)** y **MSLA (Masked Stereolithography)** utiliza resinas líquidas compuestas por **monómeros, oligómeros y fotoiniciadores**.
                            
                            Cuando la luz ultravioleta con longitud de onda específica de **$405\\,\\text{nm}$** incide sobre la resina líquida, los fotoiniciadores se activan y desencadenan una reacción en cadena de entrecruzamiento molecular (*cross-linking*), transformando el líquido en un polímero termoestable sólido en fracciones de segundo.
                            
                            * **Resolución XY:** Determinada por el tamaño de píxel de la pantalla LCD (ejemplo: pantallas 8K/12K alcanzan entre $19\\,\\mu\\text{m}$ y $28\\,\\mu\\text{m}$, frente a los $400\\,\\mu\\text{m}$ de una boquilla FDM).
                            * **Espesor de Capa Z:** Rango estándar de **$0.025\\,\\text{mm}$ a $0.050\\,\\text{mm}$ ($25-50\\,\\mu\\text{m}$)**, logrando superficies lisas con micro-detalles imperceptibles a simple vista.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 190" width="100%" height="180" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">🔬 Arquitectura Óptica de una Impresora MSLA (LCD + Matriz UV)</text>
                                
                                <!-- Plataforma de Construcción Z -->
                                <g transform="translate(40, 45)">
                                    <rect x="0" y="0" width="130" height="95" rx="6" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
                                    <text x="65" y="22" fill="#a78bfa" font-size="10.5" font-weight="bold" text-anchor="middle">1. Plataforma (Z)</text>
                                    <rect x="25" y="36" width="80" height="12" rx="2" fill="#64748b"/>
                                    <line x1="65" y1="10" x2="65" y2="36" stroke="#94a3b8" stroke-width="3"/>
                                    <text x="65" y="70" fill="#f8fafc" font-size="9" text-anchor="middle">Tracción Invertida</text>
                                    <text x="65" y="115" fill="#94a3b8" font-size="9.5" text-anchor="middle">Sube capa a capa</text>
                                </g>

                                <text x="185" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Cuba de Resina + Film FEP -->
                                <g transform="translate(210, 45)">
                                    <rect x="0" y="0" width="145" height="95" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5"/>
                                    <text x="72" y="22" fill="#06b6d4" font-size="10.5" font-weight="bold" text-anchor="middle">2. Cuba & FEP/PFA</text>
                                    <rect x="15" y="38" width="115" height="28" fill="rgba(139, 92, 246, 0.25)" stroke="#8b5cf6" stroke-width="1"/>
                                    <line x1="15" y1="66" x2="130" y2="66" stroke="#38bdf8" stroke-width="2"/>
                                    <text x="72" y="56" fill="#c084fc" font-size="9" font-weight="bold" text-anchor="middle">Resina Líquida</text>
                                    <text x="72" y="115" fill="#94a3b8" font-size="9.5" text-anchor="middle">Lámina antiadherente</text>
                                </g>

                                <text x="370" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Pantalla LCD Monocromo -->
                                <g transform="translate(395, 45)">
                                    <rect x="0" y="0" width="145" height="95" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="72" y="22" fill="#10b981" font-size="10.5" font-weight="bold" text-anchor="middle">3. LCD Fotomáscara</text>
                                    <rect x="20" y="42" width="105" height="16" rx="2" fill="#0284c7"/>
                                    <text x="72" y="54" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">Píxeles 8K / 12K</text>
                                    <text x="72" y="75" fill="#f8fafc" font-size="9" text-anchor="middle">Bloquea / Pasa luz</text>
                                    <text x="72" y="115" fill="#94a3b8" font-size="9.5" text-anchor="middle">Capa en 1.5 - 2.5s</text>
                                </g>

                                <text x="555" y="95" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Matriz LED UV 405nm -->
                                <g transform="translate(580, 45)">
                                    <rect x="0" y="0" width="140" height="95" rx="6" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
                                    <text x="70" y="22" fill="#ec4899" font-size="10.5" font-weight="bold" text-anchor="middle">4. Matriz UV 405nm</text>
                                    <circle cx="40" cy="50" r="7" fill="#8b5cf6"/>
                                    <circle cx="70" cy="50" r="7" fill="#8b5cf6"/>
                                    <circle cx="100" cy="50" r="7" fill="#8b5cf6"/>
                                    <text x="70" y="75" fill="#a78bfa" font-size="8.5" font-weight="bold" text-anchor="middle">Luz Paralela COB</text>
                                    <text x="70" y="115" fill="#94a3b8" font-size="9.5" text-anchor="middle">Emisión uniforme</text>
                                </g>
                            </svg>
                        `
                    },
                    {
                        title: '2. Comparativa Tecnológica: SLA vs DLP vs MSLA',
                        content: `
                            | Tecnología | Fuente de Emisión | Velocidad por Capa | Costo & Resolución |
                            | :--- | :--- | :--- | :--- |
                            | **MSLA (LCD)** | Matriz LED UV + Pantalla LCD fotomáscara | **Ultra Rápida** ($1.5 - 3\\,\\text{s}$ constante por capa completa) | Económica, alta resolución ($18-35\\,\\mu\\text{m}$). Estándar moderno. |
                            | **DLP (Proyector)** | Micro-espejos digitales (DMD Chip) | **Rápida** ($2 - 4\\,\\text{s}$) | Larga vida útil óptica, mayor costo del motor de luz. |
                            | **SLA Láser** | Diodo láser UV guiado por galvanómetros | **Lenta** (traza vectorialmente cada contorno) | Máquinas industriales caras (Formlabs), excelente isotropía. |
                        `
                    }
                ],
                quiz: {
                    question: '¿Cuál es la longitud de onda de luz ultravioleta estándar empleada por la mayoría de impresoras y resinas 3D de escritorio?',
                    options: [
                        '405 nm (UV Cercano / Violeta visible)',
                        '220 nm (Rayos UVC germicidas)',
                        '650 nm (Luz roja láser común)',
                        '850 nm (Infrarrojo térmico)'
                    ],
                    correctIndex: 0,
                    explanation: 'El estándar universal de fotoiniciadores para resinas 3D MSLA/SLA reacciona en el espectro de 405 nm, permitiendo una fotopolimerización rápida y segura con matrices LED de estado sólido.'
                }
            },
            {
                id: 'sla-1',
                unitIndex: 2,
                title: 'Bioseguridad & EPP',
                duration: '20 min',
                type: 'Seguridad Química y Manejo',
                expReward: 25,
                summary: 'Protocolo estricto de bioseguridad: guantes de nitrilo, respirador con filtros de carbón orgánico para COVs, ventilación y gestión ecológica de residuos.',
                sections: [
                    {
                        title: '1. Toxicidad de los Fotopolímeros y Equipos de Protección (EPP)',
                        content: `
                            Las resinas líquidas contienen acrilatos y metacrilatos que son **alérgenos por contacto, irritantes dérmicos y desprenden compuestos orgánicos volátiles (COVs)** durante la polimerización.
                            
                            **Reglas Inviolables de Bioseguridad en el Semillero:**
                            * **Guantes de Nitrilo 100% Obligatorios:** Los guantes de látex estándar son porosos a los monómeros de resina; siempre se debe usar **nitrilo grueso**.
                            * **Gafas de Protección Ocular:** Previene salpicaduras directas de resina líquida o alcohol isopropílico al retirar soportes o manipular la espátula.
                            * **Mascarilla con Filtro de Carbón Activo:** Para vapores orgánicos (norma A1 o N95 con carbón) al permanecer en ambientes cerrados junto a cubas abiertas.
                            * **Ventilación Forzada:** Trabajar en zonas con extractor de aire o filtro de carbón activado para purificar el ambiente del taller.
                        `
                    },
                    {
                        title: '2. Gestión y Desecho Ecológico de Residuos de Resina',
                        content: `
                            > ⚠️ **PROHIBIDO:** Jamás verter resina líquida, papel contaminado o alcohol isopropílico con residuos por el desagüe o tuberías públicas. Es altamente tóxico para la fauna acuática.
                            
                            * **Solidificación por Luz Solar (Curado Total):** Todo trapo, papel toalla o soporte contaminado debe exponerse al sol o cámara UV hasta quedar **completamente sólido y seco**. Una vez curado, se desecha como residuo plástico inerte común.
                            * **Evaporación y Decantación de Alcohol (IPA):** Dejar reposar los tanques de alcohol usado al sol para que la resina disuelta decante en el fondo como lodo curado; luego colar el alcohol limpio reutilizable.
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué se deben utilizar guantes de nitrilo en lugar de látex al manipular resinas fotosensibles?',
                    options: [
                        'Porque el nitrilo es impermeable a los monómeros de la resina, mientras que el látex permite su absorción dérmica.',
                        'Porque el nitrilo resiste altas temperaturas mayores a 300°C.',
                        'Porque los guantes de látex hacen que la resina se solidifique instantáneamente.',
                        'Porque el látex bloquea la luz UV de la habitación.'
                    ],
                    correctIndex: 0,
                    explanation: 'Los monómeros orgánicos atraviesan los microporos del látex provocando sensibilización alérgica y dermatitis de contacto. El nitrilo crea una barrera química impermeable y segura.'
                }
            },
            {
                id: 'sla-2',
                unitIndex: 3,
                title: 'Orientación & Ahuecado',
                duration: '30 min',
                type: 'Preparación en Slicer y Mecánica de Fluidos',
                expReward: 25,
                summary: 'Fuerzas de succión en el film FEP, inclinación angular a 30°-45° para reducir área de sección, técnicas de ahuecado (Hollow) e inserción de orificios de drenaje.',
                sections: [
                    {
                        title: '1. El Efecto Ventosa (Fuerza de Pelado o Peel Force)',
                        content: `
                            Cada vez que la pantalla cura una capa, el polímero recién solidificado queda adherido **tanto a la plataforma de construcción como a la lámina de teflón del fondo (FEP / PFA)**.
                            
                            Al elevarse el eje Z, la máquina debe ejercer una fuerza mecánica para **desprender (despegar)** la capa del FEP. Si imprimimos un modelo plano paralelo a la pantalla, la gran superficie crea un **efecto ventosa masivo** que provoca:
                            * Rotura y desgarro de la pieza de sus soportes.
                            * Rayado, estiramiento permanente o rotura del film FEP.
                            * *Layer shift* y líneas de deformación horizontal.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 170" width="100%" height="160" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="170" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">📐 Comparativa de Orientación: Plano vs Inclinado a 40°</text>
                                
                                <!-- Caso Incorrecto: Plano 0° -->
                                <g transform="translate(60, 40)">
                                    <rect x="0" y="0" width="280" height="110" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
                                    <text x="140" y="20" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">❌ Plano a 0° (Fuerza de Succión Crítica)</text>
                                    <rect x="40" y="45" width="200" height="14" fill="#f87171"/>
                                    <text x="140" y="56" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">Área transversal enorme: 200 mm²</text>
                                    <text x="140" y="85" fill="#fca5a5" font-size="9.5" text-anchor="middle">⚠️ Riesgo de fallo > 90% por despegue de FEP</text>
                                </g>

                                <!-- Caso Correcto: Ángulo 30°-45° -->
                                <g transform="translate(420, 40)">
                                    <rect x="0" y="0" width="280" height="110" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="140" y="20" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">✅ Inclinado a 35°-45° (Pelado Gradual)</text>
                                    <g transform="translate(70, 35) rotate(-35)">
                                        <rect x="0" y="0" width="140" height="14" rx="2" fill="#34d399"/>
                                    </g>
                                    <text x="140" y="85" fill="#6ee7b7" font-size="9.5" text-anchor="middle">✨ Área mínima por capa = Despegue suave y seguro</text>
                                </g>
                            </svg>
                        `
                    },
                    {
                        title: '2. Ahuecado (Hollow) y Agujeros de Drenaje (Drain Holes)',
                        content: `
                            Las piezas macizas en resina consumen gran cantidad de material costoso y aumentan el peso y las fuerzas de pelado. Para optimizar modelos grandes:
                            
                            * **Espesor de Pared (Wall Thickness):** Configurar paredes de **$1.8\\,\\text{mm}$ a $2.5\\,\\text{mm}$** en ChiTuBox o Lychee Slicer.
                            * **Agujeros de Escape de Succión:** Imprescindibles en la parte más cercana a la plataforma de construcción. Si un modelo ahuecado no tiene agujero, se crea una cámara de vacío sellada que atrapa resina líquida en su interior y fractura la pieza durante el curado por presión de gases.
                            * **Diámetro Recomendado:** Mínimo **$2.5\\,\\text{mm}$ a $3.5\\,\\text{mm}$** de diámetro para permitir que la resina no curada drene hacia la cuba.
                        `
                    }
                ],
                quiz: {
                    question: '¿Por qué es crítico colocar agujeros de drenaje en un modelo 3D de resina que ha sido ahuecado (Hollow)?',
                    options: [
                        'Para evitar el vacío por succión que revienta la pieza y permitir drenar la resina líquida atrapada en su interior.',
                        'Para que el cable de corriente de la máquina pase a través del modelo.',
                        'Para que el modelo flote en el tanque de lavado con alcohol.',
                        'Para reducir el tiempo de exposición por capa del LCD.'
                    ],
                    correctIndex: 0,
                    explanation: 'El aire y la resina atrapados en una cavidad cerrada crean un efecto pistón que succiona y rompe las paredes de la pieza. Además, la resina líquida atrapada terminaría agrietando la pieza meses después por reacción química residual.'
                }
            },
            {
                id: 'sla-3',
                unitIndex: 4,
                title: 'Lavado IPA & Post-Curado',
                duration: '25 min',
                type: 'Post-Proceso y Curado UV',
                expReward: 25,
                summary: 'Flujo completo en estación de lavado: dos etapas con alcohol isopropílico al 99%, secado con aire comprimido, remoción de soportes y horno de fotocurado UV secundario.',
                sections: [
                    {
                        title: '1. Protocolo de Lavado en 2 Etapas con Isopropanol (IPA)',
                        content: `
                            Al finalizar la impresión, la pieza sale cubierta de una película pegajosa de resina no polimerizada.
                            
                            **Estrategia de Lavado Profesional:**
                            1. **Tanque 1 (Lavado Sucio):** Baño de $3-5$ minutos en IPA reutilizado para desprender el 90% del exceso viscoso de resina.
                            2. **Tanque 2 (Lavado Limpio):** Baño de $2-3$ minutos en IPA puro al 99% en estación ultrasónica o de vórtice magnético.
                            3. **Secado Total Obligatorio:** Dejar evaporar por completo el alcohol o usar aire comprimido antes de curar con luz UV. Si se cura una pieza húmeda de alcohol, se formará una **capa blanca lechosa y antiestética permanente** (*white powdery residue*).
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 170" width="100%" height="160" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="170" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">🧼 Flujo del Post-Procesado en 4 Fases (Wash & Cure)</text>
                                
                                <!-- Fase 1: Lavado Sucio -->
                                <g transform="translate(40, 45)">
                                    <rect x="0" y="0" width="140" height="90" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
                                    <text x="70" y="22" fill="#f59e0b" font-size="10.5" font-weight="bold" text-anchor="middle">1. Tanque IPA 1</text>
                                    <text x="70" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Alcohol Usado</text>
                                    <text x="70" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">Remueve 90% resina</text>
                                    <text x="70" y="82" fill="#94a3b8" font-size="8.5" text-anchor="middle">3 a 5 min</text>
                                </g>

                                <text x="195" y="92" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Fase 2: Lavado Limpio -->
                                <g transform="translate(220, 45)">
                                    <rect x="0" y="0" width="140" height="90" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5"/>
                                    <text x="70" y="22" fill="#06b6d4" font-size="10.5" font-weight="bold" text-anchor="middle">2. Tanque IPA 2</text>
                                    <text x="70" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">IPA 99% Puro</text>
                                    <text x="70" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">Acabado no pegajoso</text>
                                    <text x="70" y="82" fill="#94a3b8" font-size="8.5" text-anchor="middle">2 a 3 min</text>
                                </g>

                                <text x="375" y="92" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Fase 3: Secado -->
                                <g transform="translate(400, 45)">
                                    <rect x="0" y="0" width="140" height="90" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="70" y="22" fill="#10b981" font-size="10.5" font-weight="bold" text-anchor="middle">3. Secado Total</text>
                                    <text x="70" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Aire Comprimido</text>
                                    <text x="70" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">Cero alcohol húmedo</text>
                                    <text x="70" y="82" fill="#94a3b8" font-size="8.5" text-anchor="middle">Anti costra blanca</text>
                                </g>

                                <text x="555" y="92" fill="#64748b" font-size="20" font-weight="bold">→</text>

                                <!-- Fase 4: Horno UV -->
                                <g transform="translate(580, 45)">
                                    <rect x="0" y="0" width="140" height="90" rx="6" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
                                    <text x="70" y="22" fill="#a78bfa" font-size="10.5" font-weight="bold" text-anchor="middle">4. Curado UV</text>
                                    <text x="70" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Luz 405nm</text>
                                    <text x="70" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">100% polimerización</text>
                                    <text x="70" y="82" fill="#94a3b8" font-size="8.5" text-anchor="middle">5 a 15 min</text>
                                </g>
                            </svg>
                        `,
                        callout: {
                            type: 'warning',
                            title: 'Protocolo de Calidad SIMI3D',
                            text: 'Nunca cures con luz UV una pieza que conserve brillo húmedo de alcohol isopropílico. El solvente reacciona con los oligómeros disueltos y genera un residuo blanco opaco irreversible.'
                        }
                    },
                    {
                        title: '2. Curado Secundario en Cámara UV (Curing Station)',
                        content: `
                            La pieza recién lavada (*Green State*) solo ha alcanzado entre el **$60\\%$ y $75\\%$ de su reticulación polimérica total**.
                            
                            * **Cámara de Curado UV (405nm):** Exposición uniforme durante **$5$ a $15$ minutos** en plato giratorio.
                            * **Efecto en las Propiedades Mecánicas:** Eleva el módulo elástico, la resistencia a la flexión y la dureza Shore D hasta sus especificaciones técnicas de ficha técnica (TDS).
                            * **Remoción de Soportes:** Se recomienda retirar los soportes **antes del curado final** (sumergiendo la pieza brevemente en agua tibia a 45°C) para evitar dejar marcas profundas en la superficie.
                        `
                    }
                ],
                quiz: {
                    question: '¿Qué sucede si introducimos a la cámara de luz UV una pieza que todavía tiene alcohol isopropílico (IPA) húmedo en su superficie?',
                    options: [
                        'Aparece una costra blanca lechosa y opaca difícil de remover debido a la precipitación del polímero disuelto en alcohol.',
                        'La pieza se derrite y vuelve al estado 100% líquido.',
                        'El alcohol aumenta el brillo y la transparencia del modelo.',
                        'La máquina se apaga por protección eléctrica.'
                    ],
                    correctIndex: 0,
                    explanation: 'El curado UV sobre alcohol húmedo causa la precipitación superficial de micro-partículas de resina disueltas, arruinando el acabado estético con una capa blanca caliza.'
                }
            },
            {
                id: 'sla-4',
                unitIndex: 5,
                title: 'Calibración & Tiempos',
                duration: '30 min',
                type: 'Calibración Óptica y Parámetros',
                expReward: 25,
                summary: 'Calibración precisa del tiempo de exposición por capa usando matrices de prueba (Cones of Calibration, Validation Matrix), capas base (Bottom Layers) y compensación de contracción.',
                sections: [
                    {
                        title: '1. Parámetros Críticos en el Software Slicer',
                        content: `
                            | Parámetro | Rango Típico (Pantalla Mono) | Función Técnica |
                            | :--- | :--- | :--- |
                            | **Bottom Layer Count** | $4 - 6$ capas | Capas base para máxima adherencia a la plataforma de aluminio. |
                            | **Bottom Exposure Time** | $20 - 35\\,\\text{s}$ | Sobre-exposición para anclar firmemente la pieza y evitar caídas a la cuba. |
                            | **Normal Layer Exposure** | **$1.6 - 2.8\\,\\text{s}$** | Tiempo de curado exacto por cada capa estándar de $50\\,\\mu\\text{m}$. |
                            | **Lift Distance (Z)** | $6 - 8\\,\\text{mm}$ | Distancia de elevación suficiente para despegar el FEP en el centro. |
                            | **Light-Off Delay / Wait** | $1.0 - 2.0\\,\\text{s}$ | Tiempo de reposo para que la resina líquida se estabilice antes de encender el LED. |
                        `
                    },
                    {
                        title: '2. Métodos de Calibración: Cones of Calibration & Matriz Rápida',
                        content: `
                            * **Sobre-Exposición (Over-exposure):** Tiempos muy altos ($>3.5\\,\\text{s}$) hacen que la luz se disperse lateralmente (*light bleed*), engrosando los detalles finos, cerrando orificios y dificultando el retiro de soportes.
                            * **Sub-Exposición (Under-exposure):** Tiempos muy bajos ($<1.4\\,\\text{s}$) generan soportes débiles que se rompen a mitad de impresión, deslaminación entre capas y piezas caídas en la cuba.
                            * **Conos de Calibración de TableFlip Foundry:** Si todos los conos del lado de éxito conectan y los del lado de fallo no tocan, el tiempo de exposición es matemáticamente perfecto.
                        `,
                        svgDiagram: `
                            <svg viewBox="0 0 760 170" width="100%" height="160" style="max-width: 720px; font-family: system-ui, sans-serif;">
                                <rect width="760" height="170" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                                <text x="380" y="24" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">🎯 Lectura de Calibración Óptica (Cones of Calibration)</text>
                                
                                <!-- Sub-expuesto -->
                                <g transform="translate(50, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
                                    <text x="100" y="22" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">⚠️ Sub-Expuesto (&lt;1.6s)</text>
                                    <text x="100" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Conos de éxito rotos</text>
                                    <text x="100" y="64" fill="#94a3b8" font-size="9" text-anchor="middle">Soportes frágiles</text>
                                    <text x="100" y="82" fill="#fca5a5" font-size="8.5" text-anchor="middle">Riesgo de caída a cuba</text>
                                </g>

                                <!-- Perfecto -->
                                <g transform="translate(280, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="100" y="22" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">✓ Exposición Óptima (~2.2s)</text>
                                    <text x="100" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Éxito: Conecta 100%</text>
                                    <text x="100" y="64" fill="#cbd5e1" font-size="9" text-anchor="middle">Fallo: Cero conexión</text>
                                    <text x="100" y="82" fill="#10b981" font-size="8.5" text-anchor="middle">Máxima precisión y detalle</text>
                                </g>

                                <!-- Sobre-expuesto -->
                                <g transform="translate(510, 45)">
                                    <rect x="0" y="0" width="200" height="95" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
                                    <text x="100" y="22" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">❌ Sobre-Expuesto (&gt;3.2s)</text>
                                    <text x="100" y="44" fill="#f8fafc" font-size="9.5" text-anchor="middle">Conos de fallo conectados</text>
                                    <text x="100" y="64" fill="#94a3b8" font-size="9" text-anchor="middle">Light Bleeding excesivo</text>
                                    <text x="100" y="82" fill="#fca5a5" font-size="8.5" text-anchor="middle">Pérdida de tolerancias</text>
                                </g>
                            </svg>
                        `,
                        callout: {
                            type: 'tip',
                            title: 'Regla de Oro en Resina',
                            text: 'El tiempo de exposición ideal es el mínimo tiempo necesario para que los soportes más finos resistan la fuerza de succión del FEP sin ensanchar los detalles geométricos del modelo.'
                        }
                    }
                ],
                quiz: {
                    question: '¿Qué síntoma visual indica que una impresión en resina está sobre-expuesta (Over-exposed)?',
                    options: [
                        'Pérdida de detalles finos, agujeros más estrechos de lo diseñado y soportes excesivamente duros de retirar.',
                        'La pieza se despega de la plataforma de aluminio y queda pegada al FEP.',
                        'Capas delaminadas que se abren como hojas de un libro.',
                        'La resina no se solidifica y permanece líquida.'
                    ],
                    correctIndex: 0,
                    explanation: 'La luz UV dispersada por exceso de tiempo polimeriza resina más allá del límite del píxel (light bleeding), engrosando paredes, cerrando tolerancias y perdiendo nitidez geométrica.'
                }
            }
        ]
    }
};
