import { useState } from 'react';
import { SurveyResponseDto} from '../../../api';
import SurveyModal from './SurveyModal';
import SurveyCardUser from './SurveyCardUser.tsx';
import Loading from "../../../shared/Loading.tsx";
import {useInitializeActiveSurveys} from "../../../hooks";

export default function SurveysPageUser() {
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponseDto | null>(null);
    const { surveys, loading } = useInitializeActiveSurveys();

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
                    }}
                />
            )}
        </div>
    );
}