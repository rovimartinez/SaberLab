import React, { useState, useMemo, useEffect } from 'react';
import { 
    FolderOpen, FileText, Video, ExternalLink, Play, 
    Book, Link as LinkIcon, Zap, Bot, Search, 
    Layers, Sparkles, X, Globe, Cpu, Wrench, CheckCircle2,
    Plus, Edit2, Trash2, Save, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import '../styles/PanelRecursos.css';

// ── BANCO DE RECURSOS EXTERNOS OFICIALES, CANALES Y FUENTES CONFIABLES ──
const OFFICIAL_EXTERNAL_RESOURCES = [
    // ════════════════════════════════════════════════════════════════════
    // ⚡ ELECTRICIDAD Y ELECTRÓNICA BÁSICA (EE)
    // ════════════════════════════════════════════════════════════════════
    {
        id: 'ee-vid-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Ley de Ohm y Conceptos Fundamentales de Circuitos (Español)',
        source: 'Khan Academy en Español',
        sourceType: 'YouTube',
        description: 'Explicación conceptual y matemática de la relación entre Voltaje (V), Corriente (I) y Resistencia (R) con demostraciones visuales y ejercicios.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=m7hyE1Tq-o8',
        videoId: 'm7hyE1Tq-o8',
        tags: ['Ley de Ohm', 'Khan Academy', 'Voltaje', 'Corriente']
    },
    {
        id: 'ee-vid-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Leyes de Kirchhoff: Método de Mallas y Nodos (Español)',
        source: 'JulioProfe Oficial',
        sourceType: 'YouTube',
        description: 'Resolución paso a paso de circuitos eléctricos complejos aplicando la Ley de Corrientes de Kirchhoff (LCK) y Ley de Voltajes de Kirchhoff (LVK).',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=0k0w6l7oYmE',
        videoId: '0k0w6l7oYmE',
        tags: ['Kirchhoff', 'Mallas', 'Nodos', 'JulioProfe']
    },
    {
        id: 'ee-vid-3',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Laboratorio de Multímetro: Medición de Voltaje, Corriente y Resistencia (Español)',
        source: 'El Profe García',
        sourceType: 'YouTube',
        description: 'Guía práctica para medir voltaje DC en paralelo, corriente en serie sin fundir el fusible, y pruebas de continuidad y resistencia.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=R9Z8X7e9r4w',
        videoId: 'R9Z8X7e9r4w',
        tags: ['Multímetro', 'Protoboard', 'El Profe García', 'Mediciones']
    },
    {
        id: 'ee-sim-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'PhET: Kit de Construcción de Circuitos DC (Español)',
        source: 'Universidad de Colorado Boulder',
        sourceType: 'Simulador PhET',
        description: 'Laboratorio virtual interactivo de física para armar circuitos serie, paralelo y mixtos con baterías, bombillas, interruptores y voltímetros en tiempo real.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://phet.colorado.edu/es/simulations/circuit-construction-kit-dc',
        tags: ['PhET Colorado', 'Simulación DC', 'Interactivo']
    },
    {
        id: 'ee-sim-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Falstad Circuit Simulator Online (Inglés)',
        source: 'Paul Falstad Simulator',
        sourceType: 'Simulador Web',
        description: 'Potente simulador electrónico en tiempo real con animación de corrientes eléctricas, osciloscopio virtual y cientos de esquemas electrónicos.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://www.falstad.com/circuit/',
        tags: ['Falstad', 'Osciloscopio', 'Electrónica Analógica']
    },
    {
        id: 'ee-sim-3',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Autodesk Tinkercad Circuits (Español)',
        source: 'Autodesk',
        sourceType: 'Plataforma 3D',
        description: 'Simulador de protoboards 3D interactivo con componentes electrónicos reales, multímetros digitales, fuentes de alimentación y osciloscopios.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://www.tinkercad.com/circuits',
        tags: ['Tinkercad', 'Autodesk', 'Protoboard 3D']
    },
    {
        id: 'ee-sim-tinkered',
        courseId: 1,
        courseAbbr: 'GENERAL',
        courseName: 'Electricidad y Robótica',
        courseColor: '#38bdf8',
        title: 'Tinkered AI: Simulador de Circuitos con Inteligencia Artificial (Inglés)',
        source: 'Tinkered AI',
        sourceType: 'Simulador Web / IA',
        description: 'Simulador interactivo y asistente inteligente para diseño, esquemáticos y pruebas virtuales de circuitos electrónicos con Inteligencia Artificial en tiempo real.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://app.tinkered.ai/',
        tags: ['Tinkered AI', 'Simulador de Circuitos', 'Inteligencia Artificial', 'Simuladores']
    },
    {
        id: 'ee-doc-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Libro Abierto de Circuitos de Corriente Continua DC (Inglés)',
        source: 'All About Circuits',
        sourceType: 'Documentación Oficial',
        description: 'Tratado completo de teoría eléctrica: Teoremas de Thevenin y Norton, divisor de tensión, divisor de corriente y análisis de potencia.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://www.allaboutcircuits.com/textbook/direct-current/',
        tags: ['All About Circuits', 'Teoría DC', 'Thevenin']
    },
    {
        id: 'ee-doc-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Base de Datos Oficial de Datasheets de Semiconductores (Inglés)',
        source: 'ALLDATASHEET',
        sourceType: 'Hojas Técnicas',
        description: 'Búsqueda y descarga directa de hojas de datos oficiales de fabricantes para diodos 1N4007, transistores 2N2222, BC547, BC557 y CI 555.',
        category: 'docs',
        type: 'Datasheet',
        url: 'https://www.alldatasheet.com/',
        tags: ['Datasheets', '1N4007', '2N2222', 'NE555']
    },

    // ════════════════════════════════════════════════════════════════════
    // 🤖 ROBÓTICA EDUCATIVA (RE) - CLASES Y SIMULACIÓN
    // ════════════════════════════════════════════════════════════════════
    {
        id: 're-sim-tinkercad',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Autodesk Tinkercad: Laboratorio y Simulación Virtual de Circuitos (Español)',
        source: 'Autodesk Tinkercad',
        sourceType: 'Simulador 3D y Circuitos',
        description: 'Plataforma oficial en la nube para diseñar circuitos con placas Arduino Uno, protoboards interactivas, componentes electrónicos, actuadores y modelado 3D.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://www.tinkercad.com/',
        tags: ['Tinkercad', 'Autodesk', 'Arduino Virtual', 'Simulación 3D', 'Robótica']
    },
    {
        id: 're-vid-rm-1',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: '01 Control de un LED con C++ (Español)',
        source: 'Prof. Ronny Martinez',
        sourceType: 'YouTube Oficial',
        description: 'Fundamentos de programación en Arduino: configuración de pines con pinMode(), control de salidas digitales con digitalWrite() y retardos con delay().',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=F3_u6T7k9eM',
        videoId: 'F3_u6T7k9eM',
        tags: ['Arduino', 'LED', 'digitalWrite', 'Prof. Ronny Martinez', 'C++']
    },
    {
        id: 're-vid-rm-2',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: '02 Variables en Arduino (int) (Español)',
        source: 'Prof. Ronny Martinez',
        sourceType: 'YouTube Oficial',
        description: 'Manejo de variables numéricas tipo entero (int) para asignación de pines, conteo de iteraciones y optimización estructurada en C++ para microcontroladores.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=_SoRsNnhs9s',
        videoId: '_SoRsNnhs9s',
        tags: ['Variables int', 'C++', 'Tipos de Datos', 'Prof. Ronny Martinez', 'Arduino']
    },
    {
        id: 're-vid-rm-3',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: '03 Monitor en Serie y Telemetría (Español)',
        source: 'Prof. Ronny Martinez',
        sourceType: 'YouTube Oficial',
        description: 'Uso del puerto serie (Serial.begin, Serial.println) para depuración en vivo, diagnóstico de código y telemetría de datos en tiempo real.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=Aq6lEjhf0CQ',
        videoId: 'Aq6lEjhf0CQ',
        tags: ['Monitor Serie', 'Serial.print', 'Depuración', 'Prof. Ronny Martinez', 'Telemetría']
    },
    {
        id: 're-vid-rm-4',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: '04 Control de Dos LED con C++ (Español)',
        source: 'Prof. Ronny Martinez',
        sourceType: 'YouTube Oficial',
        description: 'Control secuencial, sincronización y alternancia de múltiples actuadores LED utilizando programación C++ y temporización con delay() en Arduino.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=Ll6Z0f0AN44',
        videoId: 'Ll6Z0f0AN44',
        tags: ['Control 2 LEDs', 'C++', 'Secuencias', 'Prof. Ronny Martinez', 'Arduino']
    },
    {
        id: 're-sim-1',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Wokwi: Simulador Online de Arduino y ESP32 (Inglés)',
        source: 'Wokwi Cloud Simulator',
        sourceType: 'Simulador Web',
        description: 'Simulador online de microcontroladores Arduino Uno, Mega y ESP32 con soporte para código C++, pantallas LCD I2C, pulsadores, servos y sensores.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://wokwi.com/',
        tags: ['Wokwi', 'Simulador Arduino', 'C++', 'Nube']
    },
    {
        id: 're-doc-1',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Referencia Oficial del Lenguaje Arduino C++ (Inglés)',
        source: 'Arduino Official Docs (arduino.cc)',
        sourceType: 'Documentación Oficial',
        description: 'Documentación técnica oficial de funciones (pinMode, digitalWrite, analogRead, millis), estructuras de control y tipos de variables en C++.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://www.arduino.cc/reference/en/',
        tags: ['Arduino Docs', 'Referencia C++', 'Funciones']
    },
    {
        id: 're-doc-2',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Pinout y Especificaciones Técnicas de Arduino Uno R3 (Inglés)',
        source: 'Arduino Hardware Reference',
        sourceType: 'Documentación Oficial',
        description: 'Guía oficial de hardware con esquemático del microcontrolador ATmega328P, consumo eléctrico, pines de alimentación e interfaces I2C/SPI.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://docs.arduino.cc/hardware/uno-rev3/',
        tags: ['Hardware', 'Pinout', 'ATmega328P']
    },

    // ════════════════════════════════════════════════════════════════════
    // 🛠️ PROYECTOS DE ROBÓTICA Y ELECTRÓNICA (RE)
    // ════════════════════════════════════════════════════════════════════
    {
        id: 're-proj-1',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Brazo Robótico con Arduino: Proyecto Rápido y Fácil (Inglés)',
        source: 'DIY Maker Projects',
        sourceType: 'Proyecto YouTube',
        description: 'Construcción y calibración de un brazo robótico de 4 grados de libertad con servomotores SG90 y placa Arduino.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=JBl7gwf7ORU',
        videoId: 'JBl7gwf7ORU',
        tags: ['Brazo Robótico', 'Servos SG90', 'Arduino', 'Proyectos']
    },
    {
        id: 're-proj-2',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Brazo Robótico Casero con Servomotores y Cartón (Español)',
        source: 'El Increíble Mundo del Vine',
        sourceType: 'Proyecto YouTube',
        description: 'Experimento y armado casero paso a paso de una estructura robótica articulada utilizando servomotores y materiales accesibles.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=-r-RPLpYbW8',
        videoId: '-r-RPLpYbW8',
        tags: ['Brazo Robótico', 'Mecatrónica', 'DIY', 'Proyectos']
    },
    {
        id: 're-proj-3',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Perro Robot Cuadrúpedo con Arduino: Diseño 3D y Cinemática Inversa (Inglés)',
        source: 'LubLune Projects',
        sourceType: 'Proyecto YouTube',
        description: 'Proceso completo de ingeniería: modelado e impresión 3D, cinemática inversa, servomotores y algoritmos de marcha cuadrúpeda.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=6iZg_NbQ3vc',
        videoId: '6iZg_NbQ3vc',
        tags: ['Robot Cuadrúpedo', 'Cinemática Inversa', 'Impresión 3D', 'Arduino']
    },
    {
        id: 're-proj-4',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Basurero Inteligente con Separación de Residuos Secos, Húmedos y Metales (Inglés)',
        source: 'Skynet Robotics',
        sourceType: 'Proyecto YouTube',
        description: 'Contenedor automatizado con sensores capacitivos, inductivos y servomotores para clasificación ecológica de desechos.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=4XedfXtPxLQ',
        videoId: '4XedfXtPxLQ',
        tags: ['Basurero Inteligente', 'Sensores', 'Ecología', 'Arduino']
    },
    {
        id: 're-proj-5',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Sistema Automático de Peaje y Barrera de Estacionamiento con Sensor Ultrasónico (Inglés)',
        source: 'The Neo Studios',
        sourceType: 'Proyecto YouTube',
        description: 'Control automático de acceso vehicular con sensor de distancia ultrasónico, servomotor de barrera y señalización luminosa.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=O7yoa-hwnkI',
        videoId: 'O7yoa-hwnkI',
        tags: ['Peaje Automático', 'Sensor Ultrasónico', 'Servomotor', 'Arduino']
    },
    {
        id: 're-proj-6',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Robot Seguidor de Línea de Alta Precisión con Arduino (Inglés)',
        source: 'hash include electronics',
        sourceType: 'Proyecto YouTube',
        description: 'Diseño y calibración de vehículo móvil guiado por matriz de sensores infrarrojos reflectivos y control PID.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=5jh-5HGvC-I',
        videoId: '5jh-5HGvC-I',
        tags: ['Seguidor de Línea', 'Sensores IR', 'Robótica Móvil', 'Arduino']
    },
    {
        id: 're-proj-7',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Cómo Hacer un Robot Seguidor de Personas con Arduino (Inglés)',
        source: 'DIY Builder',
        sourceType: 'Proyecto YouTube',
        description: 'Vehículo terrestre móvil capaz de detectar la presencia humana, mantener la distancia y seguir el desplazamiento en tiempo real.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=yAV5aZ0unag',
        videoId: 'yAV5aZ0unag',
        tags: ['Seguidor de Personas', 'Ultrasonido', 'Robótica Móvil', 'Arduino']
    },
    {
        id: 're-proj-8',
        courseId: 5,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Control de Nivel y Llenado de Tanque Manual y Automático (Español)',
        source: 'Diego Alviani',
        sourceType: 'Proyecto YouTube',
        description: 'Automatización de llenado con bomba de agua, sensor de nivel de líquidos, conmutación automática/manual y relé.',
        category: 'projects',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=KajI9CbG5IM',
        videoId: 'KajI9CbG5IM',
        tags: ['Control de Nivel', 'Automatización', 'Bomba de Agua', 'Arduino']
    }
];

const PanelRecursos = () => {
    const { profile, enrolledCourses } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [activeVideoModal, setActiveVideoModal] = useState(null);

    // Recursos en base de datos D1 y mapa de visibilidad
    const [dbResources, setDbResources] = useState([]);
    const [visibilityMap, setVisibilityMap] = useState({});
    const [deletedIds, setDeletedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('saberlab_deleted_resources') || '[]');
        } catch {
            return [];
        }
    });

    // Modal de creación / edición de recurso
    const [editingResource, setEditingResource] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    // Cargar recursos y estados de visibilidad desde Cloudflare D1
    useEffect(() => {
        const fetchDbResources = async () => {
            try {
                const { data } = await api('/resources');
                if (data?.resources) {
                    setDbResources(data.resources);
                }
                if (data?.visibilityMap) {
                    setVisibilityMap(data.visibilityMap);
                }
            } catch (err) {
                console.error('Error cargando recursos de D1:', err);
            }
        };
        fetchDbResources();
    }, []);

    const showToast = (text) => {
        setToastMessage(text);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Mapear cursos en los que está inscrito el estudiante
    const enrolledAbbrs = useMemo(() => {
        return (enrolledCourses || []).map(c => (c.abbr || '').toUpperCase());
    }, [enrolledCourses]);

    // Combinar recursos estáticos y recursos en D1
    const allCombinedResources = useMemo(() => {
        const activeStatics = OFFICIAL_EXTERNAL_RESOURCES.filter(r => !deletedIds.includes(r.id));
        
        // Mapear recursos de D1 asegurando tipos adecuados
        const formattedDb = dbResources.map(r => {
            const courseColor = r.course_abbr === 'EE' ? '#f59e0b' : '#a855f7';
            let parsedTags = [];
            if (r.tags) {
                try {
                    parsedTags = Array.isArray(r.tags) ? r.tags : (r.tags.startsWith('[') ? JSON.parse(r.tags) : r.tags.split(',').map(t => t.trim()));
                } catch {
                    parsedTags = [r.tags];
                }
            }
            return {
                id: r.id,
                courseAbbr: r.course_abbr,
                courseName: r.course_abbr === 'EE' ? 'Electricidad y Electrónica Básica' : 'Robótica Educativa',
                courseColor,
                title: r.title,
                source: r.source || 'Recurso Docente',
                sourceType: r.source_type || r.type,
                description: r.description || '',
                category: r.category || 'projects',
                type: r.type || 'YouTube',
                url: r.url,
                videoId: r.video_id,
                tags: parsedTags,
                isCustom: true
            };
        });

        // Los recursos de D1 reemplazan o se añaden a los estáticos
        const map = new Map();
        activeStatics.forEach(r => map.set(r.id, r));
        formattedDb.forEach(r => map.set(r.id, r));

        return Array.from(map.values());
    }, [dbResources, deletedIds]);

    // Verificar si un recurso está visible para estudiantes
    const isResourceVisible = (resource) => {
        if (visibilityMap[resource.id] !== undefined) {
            return Boolean(visibilityMap[resource.id]);
        }
        if (resource.is_visible !== undefined) return Boolean(resource.is_visible);
        if (resource.is_active !== undefined) return Boolean(resource.is_active);
        return true;
    };

    // Filtrar recursos según cursos permitidos y visibilidad para el usuario
    const userAllowedResources = useMemo(() => {
        let list = allCombinedResources;
        if (!isStaff) {
            list = list.filter(r => (r.courseAbbr === 'GENERAL' || enrolledAbbrs.includes(r.courseAbbr)) && isResourceVisible(r));
        }
        return list;
    }, [isStaff, enrolledAbbrs, allCombinedResources, visibilityMap]);

    // Opciones de filtro por curso
    const availableCourseFilters = useMemo(() => {
        const list = [{ id: 'all', label: 'Todos los Cursos', icon: <Layers size={15} /> }];
        
        const hasEE = isStaff || enrolledAbbrs.includes('EE');
        const hasRE = isStaff || enrolledAbbrs.includes('RE');

        if (hasEE) {
            list.push({ id: 'EE', label: 'Electricidad (EE)', color: '#f59e0b', icon: <Zap size={15} /> });
        }
        if (hasRE) {
            list.push({ id: 'RE', label: 'Robótica (RE)', color: '#a855f7', icon: <Bot size={15} /> });
        }

        return list;
    }, [isStaff, enrolledAbbrs]);

    // CATEGORÍAS (Nombres concisos de una sola palabra)
    const categories = [
        { id: 'all', name: 'Todos', icon: <FolderOpen size={18} /> },
        { id: 'projects', name: 'Proyectos', icon: <Cpu size={18} /> },
        { id: 'videos', name: 'Videos', icon: <Video size={18} /> },
        { id: 'simulators', name: 'Simuladores', icon: <Globe size={18} /> },
        { id: 'docs', name: 'Documentación', icon: <FileText size={18} /> }
    ];

    const filteredResources = useMemo(() => {
        return userAllowedResources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.tags && resource.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
            
            const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
            const matchesCourse = selectedCourseFilter === 'all' || resource.courseAbbr === selectedCourseFilter;

            return matchesSearch && matchesCategory && matchesCourse;
        });
    }, [userAllowedResources, searchTerm, selectedCategory, selectedCourseFilter]);

    const getTypeBadgeStyle = (type) => {
        switch (type) {
            case 'YouTube': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
            case 'Simulador': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
            case 'Documentación': return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
            case 'Datasheet': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
            case 'Proyecto': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'rgba(255, 255, 255, 0.2)' };
        }
    };

    const handleOpenResource = (resource) => {
        if (resource.videoId) {
            setActiveVideoModal(resource);
        } else if (resource.url) {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        }
    };

    // ── GESTIÓN DOCENTE: AGREGAR / EDITAR / VISIBILIDAD DE RECURSO ──
    const handleToggleVisibility = async (resource, e) => {
        if (e) e.stopPropagation();
        const currentVis = isResourceVisible(resource);
        const nextVis = !currentVis;

        // Actualización optimista inmediata
        setVisibilityMap(prev => ({ ...prev, [resource.id]: nextVis ? 1 : 0 }));

        try {
            await api('/resources', {
                method: 'POST',
                body: {
                    action: 'toggle-visibility',
                    id: resource.id,
                    is_visible: nextVis ? 1 : 0
                }
            });
            showToast(nextVis ? `Recurso visible para estudiantes` : `Recurso oculto para estudiantes`);
        } catch {
            setVisibilityMap(prev => ({ ...prev, [resource.id]: currentVis ? 1 : 0 }));
            alert('Error al actualizar visibilidad');
        }
    };

    const handleOpenCreateModal = () => {
        setEditingResource({
            id: '',
            title: '',
            course_abbr: selectedCourseFilter !== 'all' ? selectedCourseFilter : 'RE',
            category: selectedCategory !== 'all' ? selectedCategory : 'projects',
            type: 'YouTube',
            url: '',
            source: 'Prof. Ronny Martinez',
            source_type: 'Proyecto',
            description: '',
            tags: '',
            is_visible: 1
        });
    };

    const handleOpenEditModal = (resource) => {
        setEditingResource({
            id: resource.id,
            title: resource.title,
            course_abbr: resource.courseAbbr || 'RE',
            category: resource.category || 'projects',
            type: resource.type || 'YouTube',
            url: resource.url,
            video_id: resource.videoId || '',
            source: resource.source,
            source_type: resource.sourceType,
            description: resource.description,
            tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || ''),
            is_visible: isResourceVisible(resource) ? 1 : 0
        });
    };

    const handleSaveResource = async (e) => {
        e.preventDefault();
        if (!editingResource.title.trim() || !editingResource.url.trim()) return;

        setSaving(true);
        try {
            const { data, error } = await api('/resources', {
                method: 'POST',
                body: {
                    action: 'save',
                    ...editingResource
                }
            });

            if (error) throw new Error(error.message || 'Error guardando');

            if (data?.resource) {
                setDbResources(prev => {
                    const idx = prev.findIndex(r => r.id === data.resource.id);
                    if (idx >= 0) {
                        const copy = [...prev];
                        copy[idx] = data.resource;
                        return copy;
                    }
                    return [data.resource, ...prev];
                });
                if (data.resource.is_visible !== undefined) {
                    setVisibilityMap(prev => ({ ...prev, [data.resource.id]: data.resource.is_visible }));
                }
            }

            showToast('¡Recurso guardado exitosamente en la plataforma!');
            setEditingResource(null);
        } catch (err) {
            alert(err.message || 'Error al guardar recurso');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteResource = async (resource) => {
        if (!window.confirm(`¿Estás seguro de eliminar el recurso "${resource.title}"?`)) return;

        try {
            // Si es un recurso de la BD, llamar a la API
            await api('/resources', {
                method: 'POST',
                body: { action: 'delete', id: resource.id }
            });

            // Remover de BD local
            setDbResources(prev => prev.filter(r => r.id !== resource.id));

            // Si es estático, guardarlo en la lista negra local
            const newDeleted = [...deletedIds, resource.id];
            setDeletedIds(newDeleted);
            localStorage.setItem('saberlab_deleted_resources', JSON.stringify(newDeleted));

            showToast('Recurso eliminado correctamente.');
        } catch (err) {
            alert('Error eliminando el recurso');
        }
    };

    return (
        <div className="resources-page">
            {/* Toast flotante */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 999999,
                    background: '#10b981',
                    color: '#fff',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <CheckCircle2 size={18} />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="page-header" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="header-title">
                    <Globe size={28} color="#38bdf8" />
                    <div>
                        <h1 style={{ margin: 0 }}>Centro de Recursos y Proyectos</h1>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Canales educativos verificados, proyectos de robótica, simuladores interactivos y hojas técnicas oficiales.
                        </p>
                    </div>
                </div>

                {/* DERECHA DEL ENCABEZADO: FILTRO DE CURSO + BOTÓN AGREGAR RECURSO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {availableCourseFilters.length > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: 'rgba(15, 23, 42, 0.65)',
                            padding: '4px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            {availableCourseFilters.map(cf => (
                                <button
                                    key={cf.id}
                                    onClick={() => setSelectedCourseFilter(cf.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        padding: '0.45rem 0.85rem',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        border: selectedCourseFilter === cf.id ? '1px solid #38bdf8' : 'none',
                                        background: selectedCourseFilter === cf.id ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                                        color: selectedCourseFilter === cf.id ? '#38bdf8' : '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {cf.icon}
                                    <span>{cf.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* BOTÓN DOCENTE / ADMIN: AGREGAR RECURSO */}
                    {isStaff && (
                        <button
                            onClick={handleOpenCreateModal}
                            style={{
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#fff',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                borderRadius: '12px',
                                padding: '0.55rem 1.15rem',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Plus size={15} />
                            <span>Agregar Recurso</span>
                        </button>
                    )}
                </div>
            </div>

            {/* NAV HORIZONTAL DE CATEGORÍAS (TODOS, PROYECTOS, VIDEOS, SIMULADORES, DOCUMENTACIÓN) */}
            <nav className="categories-nav-horizontal">
                {categories.map(category => {
                    const count = userAllowedResources.filter(r => 
                        (category.id === 'all' || r.category === category.id) &&
                        (selectedCourseFilter === 'all' || r.courseAbbr === selectedCourseFilter)
                    ).length;

                    return (
                        <button
                            key={category.id}
                            className={`category-nav-pill ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.icon}
                            <span>{category.name}</span>
                            <span className="category-count">{count}</span>
                        </button>
                    );
                })}
            </nav>

            {/* BARRA DE BÚSQUEDA */}
            <div className="search-and-filter">
                <div className="search-box glass-panel" style={{ borderRadius: '14px' }}>
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por título, temática, sensor, canal o etiqueta (#Arduino, #Tinkercad...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="resources-grid-container">
                    {userAllowedResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Layers size={48} color="#64748b" />
                            <h3>No tienes cursos con recursos activos</h3>
                            <p style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                                Únete a un curso como <strong>Electricidad y Electrónica Básica</strong> o <strong>Robótica Educativa</strong> para acceder a los videos y recursos oficiales.
                            </p>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Search size={48} color="#64748b" />
                            <h3>No se encontraron recursos</h3>
                            <p>Intenta con otro término de búsqueda o categoría.</p>
                        </div>
                    ) : (
                        <div className="resources-grid">
                            {filteredResources.map(resource => {
                                const badgeStyle = getTypeBadgeStyle(resource.type);
                                const isVideo = Boolean(resource.videoId || resource.category === 'videos' || resource.type === 'YouTube');
                                const isVisible = isResourceVisible(resource);

                                return (
                                    <div 
                                        key={resource.id} 
                                        className="resource-card glass-panel" 
                                        style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            position: 'relative',
                                            opacity: isVisible ? 1 : 0.68,
                                            border: !isVisible ? '1px dashed rgba(239, 68, 68, 0.45)' : undefined
                                        }}
                                    >
                                        <div className="resource-header">
                                            <div 
                                                className="resource-type-badge"
                                                style={{ 
                                                    backgroundColor: badgeStyle.bg, 
                                                    color: badgeStyle.color,
                                                    border: `1px solid ${badgeStyle.border}`
                                                }}
                                            >
                                                {isVideo ? <Video size={14} /> : <ExternalLink size={14} />}
                                                <span>{resource.type}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span 
                                                    className="resource-subject"
                                                    style={{ 
                                                        fontWeight: 700, 
                                                        fontSize: '0.78rem', 
                                                        color: resource.courseColor,
                                                        background: `${resource.courseColor}15`,
                                                        padding: '2px 8px',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    {resource.courseAbbr}
                                                </span>

                                                {/* Badge de Oculto para Docente / Admin */}
                                                {!isVisible && (
                                                    <span 
                                                        style={{ 
                                                            fontWeight: 800, 
                                                            fontSize: '0.72rem', 
                                                            color: '#f87171',
                                                            background: 'rgba(239, 68, 68, 0.15)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            padding: '2px 6px',
                                                            borderRadius: '5px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <EyeOff size={11} />
                                                        <span>Oculto</span>
                                                    </span>
                                                )}

                                                {/* Botones de gestión para Docente / Admin */}
                                                {isStaff && (
                                                    <div style={{ display: 'flex', gap: '4px', marginLeft: '0.25rem' }}>
                                                        {/* Botón rápido de alternar visibilidad */}
                                                        <button
                                                            onClick={(e) => handleToggleVisibility(resource, e)}
                                                            title={isVisible ? "Visible para estudiantes (Clic para ocultar)" : "Oculto para estudiantes (Clic para hacer visible)"}
                                                            style={{
                                                                background: isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                                                                border: `1px solid ${isVisible ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.45)'}`,
                                                                color: isVisible ? '#34d399' : '#f87171',
                                                                borderRadius: '6px',
                                                                width: '26px',
                                                                height: '26px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                                                        </button>

                                                        <button
                                                            onClick={() => handleOpenEditModal(resource)}
                                                            title="Editar recurso"
                                                            style={{
                                                                background: 'rgba(56, 189, 248, 0.15)',
                                                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                                                color: '#38bdf8',
                                                                borderRadius: '6px',
                                                                width: '26px',
                                                                height: '26px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteResource(resource)}
                                                            title="Eliminar recurso"
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.15)',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                color: '#f87171',
                                                                borderRadius: '6px',
                                                                width: '26px',
                                                                height: '26px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="resource-title" style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
                                            {resource.title}
                                        </h3>

                                        {/* Fuente y Autor */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {resource.source}
                                            </span>
                                        </div>

                                        <p className="resource-description">{resource.description}</p>

                                        {resource.tags && resource.tags.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                {resource.tags.map(tag => (
                                                    <span 
                                                        key={tag} 
                                                        style={{ 
                                                            fontSize: '0.72rem', 
                                                            color: '#94a3b8', 
                                                            background: 'rgba(255,255,255,0.05)', 
                                                            padding: '2px 7px', 
                                                            borderRadius: '5px' 
                                                        }}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="resource-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {resource.sourceType}
                                            </span>
                                            <div className="resource-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                {isVideo && resource.videoId ? (
                                                    <button 
                                                        onClick={() => handleOpenResource(resource)}
                                                        className="action-btn"
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.4rem', 
                                                            padding: '0.4rem 0.85rem', 
                                                            width: 'auto',
                                                            borderRadius: '8px',
                                                            background: 'rgba(239, 68, 68, 0.15)', 
                                                            color: '#f87171',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}
                                                        title="Reproducir Video / Proyecto"
                                                    >
                                                        <Play size={14} fill="#f87171" />
                                                        <span>{resource.category === 'projects' ? 'Ver Proyecto' : 'Ver Video'}</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleOpenResource(resource)}
                                                        className="action-btn external" 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.4rem', 
                                                            padding: '0.4rem 0.85rem', 
                                                            width: 'auto',
                                                            borderRadius: '8px',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}
                                                        title="Abrir enlace oficial"
                                                    >
                                                        <ExternalLink size={14} />
                                                        <span>Abrir</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            {/* MODAL DE REPRODUCTOR DE VIDEO YOUTUBE */}
            {activeVideoModal && (
                <div 
                    className="join-modal-overlay" 
                    onClick={() => setActiveVideoModal(null)}
                    style={{ zIndex: 100000 }}
                >
                    <div 
                        className="join-modal-content" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '780px', width: '92%', padding: '1.5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>
                                    {activeVideoModal.title}
                                </h3>
                                <p style={{ margin: '0.2rem 0 0', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Canal / Autor: {activeVideoModal.source}
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveVideoModal(null)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Contenedor Iframe YouTube Responsivo */}
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <iframe 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.videoId}?autoplay=1`}
                                title={activeVideoModal.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', flex: 1, minWidth: '240px' }}>
                                {activeVideoModal.description}
                            </p>
                            <button
                                onClick={() => window.open(activeVideoModal.url, '_blank', 'noopener,noreferrer')}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                            >
                                <ExternalLink size={14} />
                                <span>Abrir en YouTube</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CREACIÓN / EDICIÓN PARA DOCENTES Y ADMIN */}
            {editingResource && (
                <div 
                    className="join-modal-overlay" 
                    onClick={() => setEditingResource(null)}
                    style={{ zIndex: 100001 }}
                >
                    <div 
                        className="join-modal-content" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '580px', width: '92%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {editingResource.id ? <Edit2 size={18} /> : <Plus size={18} />}
                                </div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                                    {editingResource.id ? 'Editar Recurso Educativo' : 'Agregar Nuevo Recurso'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setEditingResource(null)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveResource}>
                            {/* Título */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Título del Recurso (incluye idioma entre paréntesis ej: (Inglés), (Español)) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingResource.title}
                                    onChange={e => setEditingResource({ ...editingResource, title: e.target.value })}
                                    placeholder="Ej: Brazo Robótico con Arduino: Proyecto Paso a Paso (Inglés)"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Fila: Curso y Categoría */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                        Curso Asociado
                                    </label>
                                    <select
                                        value={editingResource.course_abbr}
                                        onChange={e => setEditingResource({ ...editingResource, course_abbr: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            borderRadius: '10px',
                                            padding: '0.7rem 0.9rem',
                                            color: '#fff',
                                            fontSize: '0.88rem'
                                        }}
                                    >
                                        <option value="RE">Robótica Educativa (RE)</option>
                                        <option value="EE">Electricidad y Electrónica (EE)</option>
                                        <option value="GENERAL">General (Ambos Cursos)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                        Categoría
                                    </label>
                                    <select
                                        value={editingResource.category}
                                        onChange={e => setEditingResource({ ...editingResource, category: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            borderRadius: '10px',
                                            padding: '0.7rem 0.9rem',
                                            color: '#fff',
                                            fontSize: '0.88rem'
                                        }}
                                    >
                                        <option value="projects">Proyectos</option>
                                        <option value="videos">Videos</option>
                                        <option value="simulators">Simuladores</option>
                                        <option value="docs">Documentación</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fila: Tipo de Recurso y Fuente / Canal */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                        Tipo de Visualización
                                    </label>
                                    <select
                                        value={editingResource.type}
                                        onChange={e => setEditingResource({ ...editingResource, type: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            borderRadius: '10px',
                                            padding: '0.7rem 0.9rem',
                                            color: '#fff',
                                            fontSize: '0.88rem'
                                        }}
                                    >
                                        <option value="YouTube">Video de YouTube</option>
                                        <option value="Proyecto">Proyecto</option>
                                        <option value="Simulador">Simulador Web</option>
                                        <option value="Documentación">Documentación Oficial</option>
                                        <option value="Datasheet">Datasheet / Hoja Técnica</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                        Autor, Canal o Fuente
                                    </label>
                                    <input
                                        type="text"
                                        value={editingResource.source}
                                        onChange={e => setEditingResource({ ...editingResource, source: e.target.value })}
                                        placeholder="Ej: Prof. Ronny Martinez, Arduino.cc..."
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            borderRadius: '10px',
                                            padding: '0.7rem 0.9rem',
                                            color: '#fff',
                                            fontSize: '0.88rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* URL / Enlace */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Enlace / URL * (si es YouTube, se detectará para ver en modal)
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={editingResource.url}
                                    onChange={e => setEditingResource({ ...editingResource, url: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Descripción */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Descripción del Recurso
                                </label>
                                <textarea
                                    rows={3}
                                    value={editingResource.description}
                                    onChange={e => setEditingResource({ ...editingResource, description: e.target.value })}
                                    placeholder="Explica qué aprenderá el estudiante o qué contiene este recurso..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Etiquetas */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Etiquetas (separadas por comas)
                                </label>
                                <input
                                    type="text"
                                    value={editingResource.tags}
                                    onChange={e => setEditingResource({ ...editingResource, tags: e.target.value })}
                                    placeholder="Arduino, Servomotores, Sensores, C++"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Checkbox de Visibilidad */}
                            <div 
                                style={{
                                    marginBottom: '1.5rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setEditingResource(prev => ({ ...prev, is_visible: prev.is_visible !== 0 ? 0 : 1 }))}
                            >
                                <input
                                    type="checkbox"
                                    id="rec-is-visible"
                                    checked={editingResource.is_visible !== 0}
                                    onChange={e => setEditingResource({ ...editingResource, is_visible: e.target.checked ? 1 : 0 })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                                />
                                <div>
                                    <label htmlFor="rec-is-visible" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', cursor: 'pointer' }}>
                                        Visible para los estudiantes
                                    </label>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                                        Si está desmarcado, el recurso solo podrá ser visto por administradores y docentes.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingResource(null)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#94a3b8',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.25rem',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.88rem',
                                        fontWeight: 800,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)'
                                    }}
                                >
                                    <Save size={15} />
                                    <span>{saving ? 'Guardando...' : (editingResource.id ? 'Guardar Cambios' : 'Publicar Recurso')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelRecursos;
