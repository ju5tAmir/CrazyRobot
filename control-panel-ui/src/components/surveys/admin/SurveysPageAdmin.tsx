import { useState } from 'react';
import { http } from '../../../helpers';
import { CreateSurveyRequestDto, SurveyResponseDto, UpdateSurveyRequestDto } from '../../../api';
import SurveyCardAdmin from './SurveyCardAdmin.tsx';
import SurveyForm from '../../surveys/admin/SurveyForm';
import Loading from '../../../shared/Loading.tsx';
import { useInitializeSurveysAdmin } from '../../../hooks';
import toast from 'react-hot-toast';

export default function SurveysPageAdmin() {
    const [editing, setEditing] = useState<SurveyResponseDto | null>(null);
    const [filterActive, setFilterActive] = useState('all');
    const { surveys, loading, setLoading, setSurveys } = useInitializeSurveysAdmin();


    async function handleSave(survey: SurveyResponseDto) {
        try {

            setLoading(true);
            if (survey.id) {
                const updateDto: UpdateSurveyRequestDto = {
                    id: survey.id,
                    title: survey.title,
                    description: survey.description,
                    surveyType: survey.surveyType,
                    isActive: survey.isActive,
                    questions: survey.questions
                };

                await http.adminSurveys.updateSurvey(updateDto, survey.id)
                    .then(r => {
                        setSurveys((prevState) =>
                        prevState.map(s => s.id === r.id ? r : s));
                        toast.success("Survey updated successfully.");
                    });
            } else {
                const createDto: CreateSurveyRequestDto = {
                    title: survey.title,
                    description: survey.description,
                    surveyType: survey.surveyType,
                    isActive: survey.isActive,
                    questions: survey.questions
                };
                await http.adminSurveys.createSurvey(createDto)
                    .then(r => {
                        setSurveys((prevState) => [...prevState, r]);
                        toast.success("Survey added successfully.");
                    });
            }
            setEditing(null);
        } catch (error) {
            toast.error("Error performing operation for the survey: " + error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id?: string) {
        if (!id) return;

        if (confirm("Are you sure you want to delete this survey?")) {
            try {
                setLoading(true);
                const response = await http.adminSurveys.deleteSurvey(id);
                if(response.status === 200) {
                    setSurveys((prevState) => prevState.filter(s => s.id !== id));
                    toast.success("Survey deleted successfully.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred: " + error);
            } finally {
                setLoading(false);
            }
        }
    }

    const filteredSurveys = surveys.filter(s => {
        if (filterActive === 'active') return s.isActive;
        if (filterActive === 'inactive') return !s.isActive;
        return true;
    });

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Surveys</h1>
                <button className="btn btn-primary" onClick={() => setEditing({isActive:true} as SurveyResponseDto)}>
                    Create Survey
                </button>
            </div>

            <div className="mb-4">
                <div className="btn-group">
                    <button
                        className={`btn btn-sm ${filterActive === 'all' ? 'btn-active' : ''}`}
                        onClick={() => setFilterActive('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn btn-sm ${filterActive === 'active' ? 'btn-active' : ''}`}
                        onClick={() => setFilterActive('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`btn btn-sm ${filterActive === 'inactive' ? 'btn-active' : ''}`}
                        onClick={() => setFilterActive('inactive')}
                    >
                        Inactive
                    </button>
                </div>
            </div>

            {loading ? (
                <Loading />
            ) : (
                filteredSurveys.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {filteredSurveys.map(survey => (
                            <SurveyCardAdmin
                                key={survey.id}
                                survey={survey}
                                onEdit={setEditing}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <p>No surveys found.</p>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => setEditing({} as SurveyResponseDto)}
                        >
                            Create your first survey
                        </button>
                    </div>
                )
            )}

            {editing && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-xl">
                        <h3 className="font-bold text-lg mb-4">
                            {editing.id ? 'Edit Survey' : 'Create New Survey'}
                        </h3>
                        <SurveyForm initial={editing} onSubmit={handleSave} onCancel={() => setEditing(null)}/>
                    </div>
                </div>
            )}
        </>
    );
}