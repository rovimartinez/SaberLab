import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import Lesson from './pages/Lesson';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import Evaluations from './pages/Evaluations';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Gadgets from './pages/Gadgets';
import SettingsPage from './pages/Settings';
import './index.css';
import { useState } from 'react';
import { Zap, Code, FlaskConical, Box, Bot, Brain } from 'lucide-react';

const MOCK_MODULES = {
    5: [
        {
            id: 'm1', name: 'Módulo 1: Fundamentos y Lógica Digital', lessons: [
                { id: 'l1', name: 'Mi primer parpadeo (Entorno y Salidas Digitales)', visible: true },
                { id: 'l2', name: 'Semáforos y Variables', visible: true },
                { id: 'l3', name: 'El Robot decide (Condicionales y Botones)', visible: true },
                { id: 'l4', name: 'Monitor Serial y el Bucle while', visible: true },
                { id: 'l5', name: 'Entradas Analógicas y Resolución', visible: true }
            ]
        },
        {
            id: 'm2', name: 'Módulo 2: Potencia, Movimiento y Ciclos', lessons: [
                { id: 'l6', name: 'Modulación PWM y el Bucle for', visible: false },
                { id: 'l7', name: 'Servomotores y Abstracción con Librerías', visible: false },
                { id: 'l8', name: 'Motores DC y el Puente H', visible: false },
                { id: 'l9', name: 'Gestión de Energía y Seguridad Eléctrica', visible: false },
                { id: 'l10', name: 'Programación Modular (Funciones)', visible: false }
            ]
        },
        {
            id: 'm3', name: 'Módulo 3: Percepción y Algoritmos Autónomos', lessons: [
                { id: 'l11', name: 'Sensor Ultrasonido (HC-SR04)', visible: false },
                { id: 'l12', name: 'Infrarrojos y Operadores Lógicos', visible: false },
                { id: 'l13', name: 'Sensores de Entorno', visible: false }
            ]
        },
        {
            id: 'm4', name: 'Módulo 4: Construcción y Didáctica', lessons: [
                { id: 'l14', name: 'Diseño Mecánico y Ensamblaje', visible: false },
                { id: 'l15', name: 'Proyecto Integrador: El Robot Autónomo', visible: false },
                { id: 'l16', name: 'Documentación Técnica y Pedagógica', visible: false }
            ]
        }
    ]
};

const INITIAL_COURSES = [
    {
        id: 1,
        name: 'Electricidad y Electrónica Básica',
        icon: <Zap size={28} />,
        color: '#f59e0b',
        modules: [
            {
                id: 'm1', name: 'Módulo 1: Introducción a la Electricidad', lessons: [
                    { id: 'l1', name: 'Conceptos básicos de electricidad', visible: true },
                    { id: 'l2', name: 'Tensión y corriente', visible: true },
                    { id: 'l3', name: 'Resistencia eléctrica', visible: true }
                ]
            },
            {
                id: 'm2', name: 'Módulo 2: Componentes Electrónicos', lessons: [
                    { id: 'l4', name: 'Resistores', visible: true },
                    { id: 'l5', name: 'Capacitores', visible: false },
                    { id: 'l6', name: 'Diodos y transistores', visible: false }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 1, name: 'María García', progress: 78 },
                    { id: 2, name: 'Carlos López', progress: 45 },
                    { id: 3, name: 'Ana Martínez', progress: 92 }
                ]
            },
            {
                id: 'g2', name: '2026-I Grupo 2', students: [
                    { id: 4, name: 'Juan Rodríguez', progress: 23 },
                    { id: 5, name: 'Laura Sánchez', progress: 65 }
                ]
            }
        ]
    },
    {
        id: 2,
        name: 'Fundamentos de Programación',
        icon: <Code size={28} />,
        color: '#3b82f6',
        modules: [
            {
                id: 'm1', name: 'Módulo 1: Fundamentos de Programación', lessons: [
                    { id: 'l1', name: '¿Qué es un programa?', visible: true },
                    { id: 'l2', name: 'Variables y tipos de datos', visible: true },
                    { id: 'l3', name: 'Operadores', visible: true }
                ]
            },
            {
                id: 'm2', name: 'Módulo 2: Control de Flujo', lessons: [
                    { id: 'l4', name: 'Condicionales if/else', visible: true },
                    { id: 'l5', name: 'Bucles while y for', visible: false },
                    { id: 'l6', name: 'Funciones y métodos', visible: false }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 6, name: 'Pedro Gómez', progress: 55 },
                    { id: 7, name: 'Sofia Ruiz', progress: 88 }
                ]
            }
        ]
    },
    {
        id: 3,
        name: 'Mediaciones Tecnológicas en la Química',
        icon: <FlaskConical size={28} />,
        color: '#10b981',
        modules: [
            {
                id: 'm1', name: 'Módulo 1: Introducción a la Química', lessons: [
                    { id: 'l1', name: 'Átomos y moléculas', visible: true },
                    { id: 'l2', name: 'Tabla periódica', visible: true },
                    { id: 'l3', name: 'Enlaces químicos', visible: true }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 13, name: 'Valentina Rojas', progress: 40 },
                    { id: 14, name: 'Mateo Herrera', progress: 72 }
                ]
            }
        ]
    },
    {
        id: 4,
        name: 'Modelado y Animación 3D',
        icon: <Box size={28} />,
        color: '#ec4899',
        modules: [
            {
                id: 'm1', name: 'Módulo 1: Introducción al 3D', lessons: [
                    { id: 'l1', name: 'Conceptos básicos de modelado', visible: true },
                    { id: 'l2', name: 'Herramientas de transformación', visible: true },
                    { id: 'l3', name: 'Materiales y texturas', visible: true }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 15, name: 'Emma Delgado', progress: 88 },
                    { id: 16, name: 'Lucas Mendoza', progress: 35 }
                ]
            }
        ]
    },
    {
        id: 5,
        name: 'Robótica Educativa',
        icon: <Bot size={28} />,
        color: '#a855f7',
        modules: MOCK_MODULES[5],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 8, name: 'Diego Fernández', progress: 100 },
                    { id: 9, name: 'Lucía Morales', progress: 75 },
                    { id: 10, name: 'Miguel Torres', progress: 60 }
                ]
            },
            {
                id: 'g2', name: '2026-II Grupo 1', students: [
                    { id: 11, name: 'Elena Castro', progress: 30 },
                    { id: 12, name: 'Andrés Vargas', progress: 45 }
                ]
            }
        ]
    },
    {
        id: 6,
        name: 'Tendencias y Desarrollo en Tecnología',
        icon: <Brain size={28} />,
        color: '#f97316',
        modules: [
            {
                id: 'm1', name: 'Módulo 1: Tendencias Actuales', lessons: [
                    { id: 'l1', name: 'Inteligencia Artificial', visible: true },
                    { id: 'l2', name: 'Blockchain y NFTs', visible: true },
                    { id: 'l3', name: 'Internet de las Cosas', visible: true }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', students: [
                    { id: 17, name: 'Isabella Ortiz', progress: 65 },
                    { id: 18, name: 'Santiago Vega', progress: 90 }
                ]
            }
        ]
    }
];

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;
    return user ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;
    return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
    const [courses, setCourses] = useState(INITIAL_COURSES);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="courses" element={<Courses courses={courses} />} />
                    <Route path="course/:id" element={<CourseDetail courses={courses} setCourses={setCourses} />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="subject/:id" element={<SubjectDetail />} />
                    <Route path="lesson/:courseId/:moduleId/:lessonId" element={<Lesson />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="evaluations" element={<Evaluations />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="gadgets" element={<Gadgets />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
