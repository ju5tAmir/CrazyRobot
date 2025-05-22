import { useState } from 'react';
import { QuestionDto, SurveySubmissionRequestDto } from '../../../api';
import { http } from '../../../helpers';
import { SurveyModalProps, QuestionType } from '../../../models';
import toast from "react-hot-toast";
import Loading from "../../../shared/Loading.tsx";


export default function SurveyModal({ survey, onClose, onComplete }: SurveyModalProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        try {
            setLoading(true);
            if(survey.id) {
                const response: SurveySubmissionRequestDto = {
                    surveyId: survey.id,
                    responses: Object.entries(answers).map(([questionId, answer]) => ({
                        questionId,
                        response: answer,
                        optionId: survey.questions?.find(q => q.id === questionId)?.options?.find(o => o.optionText === answer)?.id
                    }))
                };
                await http.userSurveys.submitResponse(response)
                    .then(() => {
                        onComplete();
                        toast.success("Survey submitted successfully.");
                    });
            }
        } catch (error) {
            toast.error("Error submitting the survey: " + error);
        } finally {
            setLoading(false);
        }
    }

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
        <>
            {loading ? (
                <Loading />
            ) : (
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
            )}
        </>
    );
}