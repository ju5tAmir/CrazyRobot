import { useEffect, useState } from 'react';
import { UserSurveysClient, SurveyResponseDto} from '../../../api/generated-client';
import SurveyModal from './SurveyModal';
import {useAuth} from "../../../SchoolInfo/auth/AuthContext.tsx";
import SurveyCardUser from './SurveyCardUser.tsx';
import Loading from "../../../shared/Loading.tsx";

export default function SurveysPageUser() {
    const { jwt } = useAuth();
    const [surveys, setSurveys] = useState<SurveyResponseDto[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const client = new UserSurveysClient(import.meta.env.VITE_API_BASE_URL, {
        fetch: (url, init) => fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `Bearer ${jwt}`
            }
        })
    });

    useEffect(() => {
        loadSurveys();
    }, []);

    async function loadSurveys() {
        try {
            setLoading(true);
            const activeSurveys = await client.getActiveSurveys();
            setSurveys(activeSurveys);
        } catch (error) {
            console.error('Failed to load surveys:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Available Surveys</h1>

            {loading ? (
                    <Loading />
                ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {surveys.map(survey => (
                    <SurveyCardUser
                        key={survey.id}
                        survey={survey}
                        onTakeSurvey={setSelectedSurvey}
                    />
                ))}
            </div>
            )}

            {selectedSurvey && (
                <SurveyModal
                    survey={selectedSurvey}
                    onClose={() => setSelectedSurvey(null)}
                    onComplete={() => {
                        setSelectedSurvey(null);
                        loadSurveys();
                    }}
                />
            )}
        </div>
    );
}