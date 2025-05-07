import { useState } from 'react';
import { UserSurveysClient, SurveyResponseDto, SurveySubmissionResponseDto } from '../../../api/generated-client';
import { useAuth } from '../../../SchoolInfo/auth/AuthContext.tsx';

interface Props {
    survey: SurveyResponseDto;
    onClose: () => void;
    onComplete: () => void;
}

export default function SurveyModal({ survey, onClose, onComplete }: Props) {
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

    async function handleSubmit() {
        try {
            const response: SurveySubmissionResponseDto = {
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
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-lg">{survey.title}</h3>
                <p className="py-4">{survey.description}</p>

                <div className="space-y-4">
                    {survey.questions?.map((question, index) => (
                        <div key={index} className="form-control">
                            <label className="label">
                                <span className="label-text">{question.questionText}</span>
                            </label>

                            {question.questionType === 'MultipleChoice' ? (
                                <div className="space-y-2">
                                    {question.options?.map((option, i) => (
                                        <label key={i} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option.optionText}
                                                onChange={e => setAnswers({
                                                    ...answers,
                                                    [question.id!]: e.target.value
                                                })}
                                                className="radio"
                                            />
                                            <span>{option.optionText}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    onChange={e => setAnswers({
                                        ...answers,
                                        [question.id!]: e.target.value
                                    })}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}