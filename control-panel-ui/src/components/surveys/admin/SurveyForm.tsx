import { useState } from 'react';
import { QuestionDto, CreateSurveyRequestDto } from '../../../api/generated-client';
import {SurveyFormProps} from "../../../models/surveys-models/SurveyFormProps.ts"
import {Trash2} from "lucide-react";

export default function SurveyForm({ initial, onSubmit }: SurveyFormProps) {
    const [survey, setSurvey] = useState<CreateSurveyRequestDto>(initial || {
        title: '',
        description: '',
        surveyType: 'General',
        isActive: true,
        questions: []
    });
    const [newQuestion, setNewQuestion] = useState<QuestionDto>({
        questionText: '',
        questionType: 'Text',
        orderNumber: (survey.questions?.length || 0) + 1,
        options: []
    });
    const [newOption, setNewOption] = useState('');

    function updateSurvey<K extends keyof CreateSurveyRequestDto>(key: K, value: any) {
        setSurvey({ ...survey, [key]: value });
    }

    function addQuestion() {
        if (!newQuestion.questionText) return;
        if (newQuestion.questionType === 'MultipleChoice' && !newQuestion.options?.length) return;

        const nextOrderNumber = (survey.questions?.length || 0) + 1;

        setSurvey({
            ...survey,
            questions: [...(survey.questions || []), { ...newQuestion, orderNumber: nextOrderNumber }]
        });

        setNewQuestion({
            questionText: '',
            questionType: 'Text',
            orderNumber: (nextOrderNumber + 1),
            options: []
        });

    }

    function addOption() {
        if (!newOption) return;
        setNewQuestion({
            ...newQuestion,
            options: [...(newQuestion.options || []), {
                optionText: newOption,
                orderNumber: (newQuestion.options?.length || 0) + 1
            }]
        });
        setNewOption('');
    }

    function removeQuestion(index: number) {
        const updatedQuestions = [...(survey.questions || [])];
        updatedQuestions.splice(index, 1);
        updatedQuestions.forEach((q, i) => q.orderNumber = i + 1);
        setSurvey({ ...survey, questions: updatedQuestions });
    }

    function removeOption(index: number) {
        const updatedOptions = [...(newQuestion.options || [])];
        updatedOptions.splice(index, 1);
        updatedOptions.forEach((o, i) => o.orderNumber = i + 1);
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Basic info section */}
            <div className="grid gap-2">
                <div className="w-full">
                    <input
                        value={survey.title}
                        onChange={e => updateSurvey('title', e.target.value)}
                        placeholder="Survey Title"
                        className="input input-bordered w-full"
                    />
                </div>

                <div className="w-full">
            <textarea
                value={survey.description || ''}
                onChange={e => updateSurvey('description', e.target.value)}
                placeholder="Survey Description"
                className="textarea textarea-bordered w-full"
                rows={3}
            />
                </div>

                <div className="w-full">
                    <input
                        value={survey.surveyType}
                        onChange={e => updateSurvey('surveyType', e.target.value)}
                        placeholder="Survey Type"
                        className="input input-bordered w-full"
                    />
                </div>

                <div className="w-full">
                    <label className="cursor-pointer label justify-start gap-2">
                        <span>Active</span>
                        <input
                            type="checkbox"
                            checked={survey.isActive}
                            onChange={e => updateSurvey('isActive', e.target.checked)}
                            className="checkbox checkbox-primary"
                        />
                    </label>
                </div>
            </div>

            <div className="divider">Questions</div>

            {/* Questions section with fixed height and scroll */}
            <div className="max-h-[250px] overflow-y-auto pr-2">
                {survey.questions?.map((question, i) => (
                    <div key={i} className="card bg-base-200 p-4 mb-3">
                        <div className="flex justify-between">
                            <h3 className="font-medium">{question.orderNumber + " - " + question.questionText}</h3>
                            <button
                                className="btn btn-ghost btn-xs p-1"
                                onClick={() => removeQuestion(i)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-error transition-transform hover:scale-130" />
                            </button>
                        </div>
                        <p className="text-sm opacity-70">Type: {question.questionType}</p>
                        {question.options?.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium">Options:</p>
                                <ul className="ml-4 list-disc">
                                    {question.options.map((opt, j) => (
                                        <li key={j} className="text-sm">{opt.optionText}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 p-4 border border-dashed border-base-300">
                <h3 className="font-medium mb-2">New Question</h3>
                <input
                    value={newQuestion.questionText}
                    onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                    placeholder="Question Text"
                    className="input input-bordered w-full mb-2"
                />

                <select
                    value={newQuestion.questionType}
                    onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}
                    className="select select-bordered w-full mb-2"
                >
                    <option value="Text">Text</option>
                    <option value="MultipleChoice">Multiple Choice</option>
                    <option value="Rating">Rating</option>
                </select>

                {newQuestion.questionType === 'MultipleChoice' && (
                    <div className="mt-2">
                        <div className="flex gap-2 mb-2">
                            <input
                                value={newOption}
                                onChange={e => setNewOption(e.target.value)}
                                placeholder="Option text"
                                className="input input-bordered input-sm flex-1"
                            />
                            <button
                                className="btn btn-sm"
                                onClick={addOption}
                            >
                                Add Option
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {newQuestion.options?.map((opt, i) => (
                                <div key={i} className="badge badge-outline gap-1">
                                    {opt.optionText}
                                    <button onClick={() => removeOption(i)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className="btn btn-sm btn-primary mt-4"
                    onClick={addQuestion}
                    disabled={!newQuestion.questionText}
                >
                    Add Question
                </button>
            </div>

            <button
                className="btn btn-primary mt-4"
                onClick={() => onSubmit(survey)}
                disabled={!survey.title || !survey.questions?.length}
            >
                {initial?.id ? 'Update Survey' : 'Create Survey'}
            </button>
        </div>
    );
}