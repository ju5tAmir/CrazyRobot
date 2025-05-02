import { useState, useEffect } from 'react';
import { useAuth } from '../../../SchoolInfo/auth/AuthContext.tsx';
import { CreateSurveyRequestDto, AdminSurveysClient, SurveyResponseDto, UpdateSurveyRequestDto } from '../../../api/generated-client.ts';
import SurveyCard from '../../surveys/admin/SurveyCard.tsx';
import SurveyForm from '../../surveys/admin/SurveyForm';
import Loading from '../../../shared/Loading.tsx';

export default function SurveysAdmin() {
    const { jwt } = useAuth();
    const client = new AdminSurveysClient(import.meta.env.VITE_API_BASE_URL, {
        fetch: (url, init) => fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `Bearer ${jwt}`
            }
        })
    });

    const [surveys, setSurveys] = useState<SurveyResponseDto[]>([]);
    const [editing, setEditing] = useState<SurveyResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterActive, setFilterActive] = useState('all');

    useEffect(() => {
        refreshSurveys();
    }, []);

    async function refreshSurveys() {
        try {
            setLoading(true);
            const result = await client.getAllSurveys();
            setSurveys(Array.isArray(result) ? result : [result]);
        } catch (error) {
            console.error("Failed to fetch surveys:", error);
        } finally {
            setLoading(false);
        }
    }

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
                await client.updateSurvey(updateDto, survey.id);
            } else {
                const createDto: CreateSurveyRequestDto = {
                    title: survey.title,
                    description: survey.description,
                    surveyType: survey.surveyType,
                    isActive: survey.isActive,
                    questions: survey.questions
                };
                await client.createSurvey(createDto);
            }
            await refreshSurveys();
            setEditing(null);
        } catch (error) {
            console.error("Failed to save survey:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id?: string) {
        if (!id) return;

        if (confirm("Are you sure you want to delete this survey?")) {
            try {
                setLoading(true);
                await client.deleteSurvey(id);
                await refreshSurveys();
            } catch (error) {
                console.error("Failed to delete survey:", error);
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
                <button className="btn btn-primary" onClick={() => setEditing({} as SurveyResponseDto)}>
                    + New Survey
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
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredSurveys.map(survey => (
                            <div key={survey.id} className="relative">
                                <SurveyCard survey={survey} />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                        className="btn btn-circle btn-sm btn-ghost"
                                        onClick={() => setEditing(survey)}
                                    >
                                        <i className="icon-[lucide--pencil] w-4 h-4" />
                                    </button>
                                    <button
                                        className="btn btn-circle btn-sm btn-ghost text-error"
                                        onClick={() => handleDelete(survey.id)}
                                    >
                                        <i className="icon-[lucide--trash] w-4 h-4" />
                                    </button>
                                </div>
                            </div>
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
                    <div className="modal-box max-w-3xl">
                        <h3 className="font-bold text-lg mb-4">
                            {editing.id ? 'Edit Survey' : 'Create New Survey'}
                        </h3>
                        <SurveyForm initial={editing} onSubmit={handleSave} />
                        <div className="modal-action">
                            <button className="btn" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}