import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout   from './layout/AdminLayout';
import ContactsAdmin from './pages/ContactsAdmin';
import EventsAdmin   from './pages/EventsAdmin';
import { useAuth } from '../auth/AuthContext';
import LoginPage     from '../auth/LoginPage';
import SurveysPageAdmin from "../../components/surveys/admin/SurveysPageAdmin.tsx";
import SurveyResultsPageAdmin from "../../components/surveys/admin/SurveyResultsPageAdmin.tsx";
import AIReportsPage from './pages/AIReportsPage';

export default function Admin() {
    const { jwt } = useAuth();

    return (
        <AdminLayout>
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route index element={<Navigate to="login" replace />} />

                {jwt && (
                <>
                    <Route path="contacts" element={<ContactsAdmin />} />
                    <Route path="events"   element={<EventsAdmin />} />
                    <Route path="surveys" element={<SurveysPageAdmin />} />
                    <Route path="survey-results"   element={<SurveyResultsPageAdmin />} />
                    <Route path="ai-reports" element={<AIReportsPage />} />
                </>
            )}
            </Routes>
        </AdminLayout>
    );
}
