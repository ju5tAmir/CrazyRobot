import { Route, Routes } from 'react-router-dom';
import AdminLayout   from './layout/AdminLayout';
import ContactsAdmin from './pages/ContactsAdmin';
import EventsAdmin   from './pages/EventsAdmin';
import SurveysPageAdmin from "../../components/surveys/admin/SurveysPageAdmin.tsx";
import SurveyResultsPageAdmin from "../../components/surveys/admin/SurveyResultsPageAdmin.tsx";
import AIReportsPage from './pages/AIReportsPage';

export default function Admin() {

    return (
        <AdminLayout>
            <Routes>
                <Route path="contacts" element={<ContactsAdmin />} />
                <Route path="events"   element={<EventsAdmin />} />
                <Route path="surveys" element={<SurveysPageAdmin />} />
                <Route path="survey-results"   element={<SurveyResultsPageAdmin />} />
                <Route path="ai-reports" element={<AIReportsPage />} />
            </Routes>
        </AdminLayout>
    );
}
