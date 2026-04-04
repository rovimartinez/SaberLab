import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import EvaluationPlayer from './pages/EvaluationPlayer';
import EvaNoti from './pages/evanoti';
import EvaExam from './pages/EvaExam';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Widgets from './pages/Widgets';
import SettingsPage from './pages/Settings';
import AccessRequests from './pages/AccessRequests';
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
                    <Route index element={<Dashboard />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="courses" element={<AdminRoute><Courses courses={courses} /></AdminRoute>} />
                    <Route path="course/:id" element={<CourseDetail courses={courses} setCourses={setCourses} />} />
                    <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="requests" element={<AdminRoute><AccessRequests /></AdminRoute>} />
                    <Route path="learn/:id" element={<RedirectToMyCourses />} />
                    <Route path="learn/:courseId/:moduleId/:lessonId" element={<RedirectLessonToMyCourses />} />
                    <Route path="my-courses/:id" element={<SubjectDetail />} />
                    <Route path="my-courses/:courseId/:moduleId/:lessonId" element={<Lesson />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="evaluations" element={<Evaluations />} />
                    <Route path="evaluations/re-m1-e2" element={<EvaNoti />} />
                    <Route path="evaluations/re-m1-e2-play" element={<EvaExam />} />
                    <Route path="evaluations/:evaluationKey" element={<EvaluationPlayer />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="myapps" element={<Widgets />} />
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
