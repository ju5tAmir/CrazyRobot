import { useEffect, useState } from 'react';
import { UserSurveysClient, SurveyResponseDto} from '../../../api/generated-client';
import SurveyModal from './SurveyModal';
import {useAuth} from "../../../SchoolInfo/auth/AuthContext.tsx";
import SurveyCard from './SurveyCard.tsx';

export default function SurveysPage() {
    const { jwt } = useAuth();
    const [surveys, setSurveys] = useState<SurveyResponseDto[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponseDto | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
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
            const activeSurveys = await client.getActiveSurveys();
            setSurveys(activeSurveys);
        } catch (error) {
            console.error('Failed to load surveys:', error);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Available Surveys</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {surveys.map(survey => (
                    <SurveyCard
                        key={survey.id}
                        survey={survey}
                        onTakeSurvey={setSelectedSurvey}
                    />
                ))}
            </div>

            {showPrompt && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Help Us Improve!</h3>
                        <p className="py-4">Would you like to take a moment to share your feedback about this week?</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowPrompt(false)}
                            >
                                Maybe Later
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowPrompt(false);
                                    setSelectedSurvey(selectedSurvey);
                                }}
                            >
                                Take Survey
                            </button>
                        </div>
                    </div>
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