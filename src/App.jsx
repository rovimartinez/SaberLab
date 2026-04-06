import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/layout/Layout';
import PanelInicio from './pages/PanelInicio';
import SubjectDetail from './pages/SubjectDetail';
import Lesson from './pages/Lesson';
import Login from './pages/Login';
import PanelMisCursos from './pages/PanelMisCursos';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import PanelPlataforma from './pages/PanelPlataforma';
import PanelNotificaciones from './pages/PanelNotificaciones';
import PanelEvaluaciones from './pages/PanelEvaluaciones';
import EvaluationInstruction from './pages/EvaluationInstruction';
import EvaluationPlayer from './pages/EvaluationPlayer';
import PanelProgreso from './pages/PanelProgreso';
import PanelRecursos from './pages/PanelRecursos';
import PanelWidgets from './pages/PanelWidgets';
import SettingsPage from './pages/Settings';
import AccessRequests from './pages/AccessRequests';
import PanelGestion from './pages/PanelGestion';
import Landing from './pages/Landing';
import RequestAccess from './pages/RequestAccess';
import './index.css';
import { useState } from 'react';
import { COURSES_DEFINITION, getCourseByIdentifier } from './data/coursesData.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading, profile } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!profile) {
        return <Navigate to="/request-access" replace />;
    }

    return children;
};

const AdminRoute = ({ children }) => {
    const { profile, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;
    return profile?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading, profile } = useAuth();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Cargando...</div>;

    if (user && !profile) {
        return <Navigate to="/request-access" replace />;
    }

    return user ? <Navigate to="/dashboard" replace /> : children;
};

const RedirectToMyCourses = () => {
    const { id } = useParams();
    const course = getCourseByIdentifier(id);
    const targetId = course ? course.slug : id;
    return <Navigate to={`/dashboard/my-courses/${targetId}`} replace />;
};

const RedirectLessonToMyCourses = () => {
    const { courseId, moduleId, lessonId } = useParams();
    const course = getCourseByIdentifier(courseId);
    const targetCourseId = course ? course.slug : courseId;
    return <Navigate to={`/dashboard/my-courses/${targetCourseId}/${moduleId}/${lessonId}`} replace />;
};

function AppRoutes() {
    const [courses, setCourses] = useState(COURSES_DEFINITION);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/request-access" element={<RequestAccess />} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<PanelInicio />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="courses" element={<AdminRoute><PanelMisCursos courses={courses} /></AdminRoute>} />
                    <Route path="course/:id" element={<CourseDetail courses={courses} setCourses={setCourses} />} />
                    <Route path="admin" element={<AdminRoute><PanelPlataforma /></AdminRoute>} />
                    <Route path="admin-panel" element={<AdminRoute><PanelGestion /></AdminRoute>} />
                    <Route path="requests" element={<AdminRoute><AccessRequests /></AdminRoute>} />
                    <Route path="learn/:id" element={<RedirectToMyCourses />} />
                    <Route path="learn/:courseId/:moduleId/:lessonId" element={<RedirectLessonToMyCourses />} />
                    <Route path="my-courses/:id" element={<SubjectDetail />} />
                    <Route path="my-courses/:courseId/:moduleId/:lessonId" element={<Lesson />} />
                    <Route path="notifications" element={<PanelNotificaciones />} />
                    <Route path="evaluations" element={<PanelEvaluaciones />} />
                    <Route path="evaluations/:evaluationKey" element={<EvaluationInstruction />} />
                    <Route path="evaluations/:evaluationKey/play" element={<EvaluationPlayer />} />
                    <Route path="progress" element={<PanelProgreso />} />
                    <Route path="resources" element={<PanelRecursos />} />
                    <Route path="myapps" element={<PanelWidgets />} />
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
