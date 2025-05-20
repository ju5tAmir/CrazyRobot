import { UserSurveyCardProps } from '../../../models';


export default function SurveyCardUser({ survey, onTakeSurvey }: UserSurveyCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl h-full flex flex-col transition-transform hover:scale-105">
            <div className="card-body flex flex-col justify-between">
                {/* Header Section */}
                <div>
                    <h2 className="card-title text-lg min-h-[3rem] line-clamp-2">{survey.title}</h2>
                    <p className="text-sm text-base-content/70 line-clamp-1 mt-2">
                        {survey.description}
                    </p>
                </div>

                {/* Badges Section */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="badge badge-outline">{survey.surveyType}</div>
                    <div className="badge badge-outline">
                        {survey.questions?.length || 0} questions
                    </div>
                </div>

                {/* Questions Preview Section */}
                <div className="mt-4 space-y-2 min-h-[4.5rem]">
                    {survey.questions?.slice(0, 2).map((q, i) => (
                        <p key={i} className="text-sm text-base-content/70 line-clamp-1">
                            • {q.questionText}
                        </p>
                    ))}
                    {(survey.questions?.length || 0) > 2 && (
                        <p className="text-sm text-base-content/50 italic">
                            + {survey.questions!.length - 2} more questions...
                        </p>
                    )}
                </div>

                {/* Action Button Section */}
                <div className="card-actions justify-end mt-4">
                    <button
                        className="btn btn-primary w-full sm:w-auto"
                        onClick={() => onTakeSurvey(survey)}
                    >
                        Take Survey
                    </button>
                </div>
            </div>
        </div>
    );
}