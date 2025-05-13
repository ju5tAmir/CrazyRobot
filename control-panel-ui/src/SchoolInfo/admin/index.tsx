import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout   from './layout/AdminLayout';
import ContactsAdmin from './pages/ContactsAdmin';
import EventsAdmin   from './pages/EventsAdmin';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import LoginPage     from '../auth/LoginPage';
import SurveysPageAdmin from "../../components/surveys/admin/SurveysPageAdmin.tsx";
import SurveyResultsPageAdmin from "../../components/surveys/admin/SurveyResultsPageAdmin.tsx";
import AIReportsPage from './pages/AIReportsPage';

function RequireAuth() {
    const { jwt } = useAuth();
    return jwt
        ? <AdminLayout />
        : <Navigate to="login" replace />;
}

export default function Admin() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route element={<RequireAuth />}>
                    <Route index element={<Navigate to="contacts" replace />} />
                    <Route path="contacts" element={<ContactsAdmin />} />
                    <Route path="events"   element={<EventsAdmin />} />
                    <Route path="surveys" element={<SurveysPageAdmin />} />
                    <Route path="survey-results"   element={<SurveyResultsPageAdmin />} />
                    <Route path="ai-reports" element={<AIReportsPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}
