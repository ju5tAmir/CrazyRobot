import { useState } from 'react';
import { UserSurveysClient, QuestionDto } from '../../../api/generated-client';
import { useAuth } from '../../../helpers/useAuth.ts';
import { SurveyModalProps } from '../../../models/surveys-models/SurveyModalProps.ts';
import { QuestionType } from '../../../models/surveys-models/enums/QuestionType.ts';


export default function SurveyModal({ survey, onClose, onComplete }: SurveyModalProps) {
    const { jwt } = useAuth();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const client = new UserSurveysClient(import.meta.env.VITE_API_BASE_URL, {
        fetch: (url, init) => fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `Bearer ${jwt}`
            }
        })
    });

    const handleSubmit = async () => {
        try {
            const response = {
                surveyId: survey.id!,
                responses: Object.entries(answers).map(([questionId, answer]) => ({
                    questionId,
                    answer
                }))
            };

            await client.submitResponse(response);
            onComplete();
        } catch (error) {
            console.error('Failed to submit survey:', error);
        }
    };

    const renderQuestion = (question: QuestionDto) => {
        if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
            return (
                <div className="space-y-2">
                    {question.options?.map((option, i) => (
                        <label key={i}
                               className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded-lg">
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.optionText}
                                checked={answers[question.id!] === option.optionText}
                                onChange={e => setAnswers({
                                    ...answers,
                                    [question.id!]: e.target.value
                                })}
                                className="radio radio-primary"
                            />
                            <span>{option.optionText}</span>
                        </label>
                    ))}
                </div>
            );
        }

        return (
            <input
                className="input input-bordered w-full mb-2 mt-2"
                placeholder="Enter your answer here..."
                value={answers[question.id!] || ''}
                onChange={e => setAnswers({
                    ...answers,
                    [question.id!]: e.target.value
                })}
            />
        );
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl max-h-[80vh]">
                <h3 className="font-bold text-xl mb-2">{survey.title}</h3>
                <p className="text-base-content/70 mb-6">{survey.description}</p>

                <div className="space-y-6">
                    {survey.questions?.map((question, index) => (
                        <div key={question.id} className="card bg-base-200 p-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg font-medium mb-2">
                                        {index + 1}. {question.questionText}
                                    </span>
                                </label>
                                {renderQuestion(question)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-action mt-8">
                    <button className="btn btn-outline btn-error" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={survey.questions?.some(q => !answers[q.id!])}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}