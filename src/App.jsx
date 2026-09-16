import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/layout/Layout';
import PanelInicio from './pages/PanelInicio';
import Login from './pages/Login';
import { COURSES_DEFINITION, getCourseByIdentifier } from './data/coursesData.jsx';
import './index.css';

// ── CODE SPLITTING (Carga bajo demanda de módulos pesados) ──
const Lesson = lazy(() => import('./pages/Lesson'));
const PanelMisCursos = lazy(() => import('./pages/PanelMisCursos'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const PanelPlataforma = lazy(() => import('./pages/PanelPlataforma'));
const PanelNotificaciones = lazy(() => import('./pages/PanelNotificaciones'));
const PanelEvaluaciones = lazy(() => import('./pages/PanelEvaluaciones'));
const EvaluationInstruction = lazy(() => import('./pages/EvaluationInstruction'));
const EvaluationPlayer = lazy(() => import('./pages/EvaluationPlayer'));
const ExamLiveLobby = lazy(() => import('./components/admin/ExamLiveLobby'));
const PanelCalificaciones = lazy(() => import('./pages/PanelCalificaciones'));
const PanelProgreso = lazy(() => import('./pages/PanelProgreso'));
const PanelRecursos = lazy(() => import('./pages/PanelRecursos'));
const PanelWidgets = lazy(() => import('./pages/PanelWidgets'));
const AccessRequests = lazy(() => import('./pages/AccessRequests'));
const PanelAnalitica = lazy(() => import('./pages/PanelAnalitica'));
const Landing = lazy(() => import('./pages/Landing'));
const RequestAccess = lazy(() => import('./pages/RequestAccess'));
const Certificate = lazy(() => import('./pages/Certificate'));
const PanelGadgets = lazy(() => import('./pages/PanelGadgets'));
const PanelRecompensas = lazy(() => import('./pages/PanelRecompensas'));
const PanelPerfil = lazy(() => import('./pages/PanelPerfil'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Welcome = lazy(() => import('./pages/Welcome'));
const JoinCourse = lazy(() => import('./pages/JoinCourse'));
const PanelSimiHub = lazy(() => import('./pages/PanelSimiHub'));

const ProtectedRoute = ({ children }) => {
    const { user, loading, profile } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!profile) {
        return <Navigate to="/request-access" replace />;
    }

    const isApproved = profile.role === 'admin' || profile.access_status === 'approved';
    if (!isApproved) {
        return <Navigate to="/request-access" replace />;
    }

    return children;
};

const AdminRoute = ({ children }) => {
    const { profile, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;
    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);
    return isStaff ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading, profile } = useAuth();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;

    if (user) {
        const pendingCode = localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
        if (pendingCode) {
            return <Navigate to={`/join?code=${encodeURIComponent(pendingCode)}`} replace />;
        }
        const isApproved = profile?.role === 'admin' || profile?.access_status === 'approved';
        return isApproved ? <Navigate to="/dashboard" replace /> : <Navigate to="/request-access" replace />;
    }

    return children;
};

const RedirectToMyCourses = () => {
    return <Navigate to="/dashboard" replace />;
};

const RedirectLessonToMyCourses = () => {
    const { courseId, moduleId, lessonId } = useParams();
    const course = getCourseByIdentifier(courseId);
    const targetCourseId = course ? course.slug : courseId;
    return <Navigate to={`/dashboard/my-courses/${targetCourseId}/${moduleId}/${lessonId}`} replace />;
};

const PageLoadingFallback = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '45vh',
        gap: '0.75rem',
        color: 'var(--text-secondary)'
    }}>
        <div style={{
            width: '28px',
            height: '28px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--brand-primary, #38bdf8)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Cargando módulo...</span>
    </div>
);

function AppRoutes() {
    const [courses, setCourses] = useState(COURSES_DEFINITION);

    return (
        <Router>
            <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                    <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/request-access" element={<RequestAccess />} />
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/join" element={<JoinCourse />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<PanelInicio />} />
                        <Route path="my-courses" element={<MyCourses />} />
                        <Route path="courses" element={<AdminRoute><PanelMisCursos courses={courses} /></AdminRoute>} />
                        <Route path="course/:id" element={<CourseDetail courses={courses} setCourses={setCourses} />} />
                        <Route path="admin-panel" element={<Navigate to="/dashboard" replace />} />
                        <Route path="requests" element={<AdminRoute><AccessRequests /></AdminRoute>} />
                        <Route path="analytics" element={<AdminRoute><PanelAnalitica /></AdminRoute>} />
                        <Route path="learn/:id" element={<RedirectToMyCourses />} />
                        <Route path="learn/:courseId/:moduleId/:lessonId" element={<RedirectLessonToMyCourses />} />
                        <Route path="my-courses/:id" element={<Navigate to="/dashboard" replace />} />
                        <Route path="my-courses/:courseId/rewards" element={<AdminRoute><PanelRecompensas /></AdminRoute>} />
                        <Route path="my-courses/:courseId/:moduleId/:lessonId" element={<Lesson />} />
                        <Route path="notifications" element={<PanelNotificaciones />} />
                        <Route path="evaluations" element={<Navigate to="/dashboard" replace />} />
                        <Route path="evaluations/:evaluationKey" element={<EvaluationInstruction />} />
                        <Route path="evaluations/:evaluationKey/play" element={<EvaluationPlayer />} />
                        <Route path="exam-lobby/:evaluationKey" element={<AdminRoute><ExamLiveLobby /></AdminRoute>} />
                        <Route path="grades" element={<PanelCalificaciones />} />
                        <Route path="progress" element={<Navigate to="/dashboard" replace />} />
                        <Route path="resources" element={<PanelRecursos />} />
                        <Route path="myapps" element={<PanelWidgets />} />
                        <Route path="settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                        {/* 🎉 Nuevas rutas */}
                        <Route path="certificate/:courseId" element={<Certificate />} />
                        <Route path="rewards" element={<AdminRoute><PanelRecompensas /></AdminRoute>} />
                        <Route path="gadgets" element={<AdminRoute><PanelRecompensas /></AdminRoute>} />
                        <Route path="profile" element={<PanelPerfil />} />
                        <Route path="simi" element={<PanelSimiHub />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
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
