import { SurveyCardProps } from '../../../models/surveys-models/SurveyCardProps.ts';
import { Pencil, Trash2 } from 'lucide-react';

export default function SurveyCard({
               survey,
               onEdit,
               onDelete,
            }: SurveyCardProps)
{
    return (
        <div className="card bg-base-100 shadow-sm relative transition-transform hover:scale-105">
            <div className="card-body p-4 gap-2">
                <div className="flex justify-between items-start gap-2">
                    <h2 className="card-title text-base">{survey.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className={`badge badge-sm font-bold ${
                            survey.isActive
                                ? 'badge-primary text-primary-content'
                                : 'bg-transparent text-error border-none'
                        }`}>
                            {survey.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="flex gap-1">
                            <button
                                className="btn btn-ghost btn-xs p-1"
                                onClick={() => onEdit?.(survey)}
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4 text-primary transition-transform hover:scale-130" />
                            </button>
                            <button
                                className="btn btn-ghost btn-xs p-1"
                                onClick={() => onDelete?.(survey.id)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-error transition-transform hover:scale-130" />
                            </button>
                        </div>
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