import { SurveyResponseDto } from '../../../api/generated-client.ts';

export default function SurveyCard({ survey }: { survey: SurveyResponseDto }) {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 gap-2">
                <div className="flex justify-between items-start">
                    <h2 className="card-title text-base">{survey.title}</h2>
                    <div className={`badge ${survey.isActive ? 'badge-success' : 'badge-outline'}`}>
                        {survey.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
                <p className="text-sm opacity-80">{survey.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <div className="badge badge-outline">{survey.surveyType}</div>
                    <div className="badge badge-outline">
                        {survey.questions?.length || 0} Questions
                    </div>
                    <div className="badge badge-outline">
                        Date created: {new Date(survey.createdAt!).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
}