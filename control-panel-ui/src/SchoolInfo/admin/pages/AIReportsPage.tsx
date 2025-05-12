import { useEffect, useState, useMemo } from 'react';
import { GeneratedReportsClient, GeneratedReportDto } from '../../../api/generated-client';
import { useAuth } from '../../auth/AuthContext';
import { FileText, BookOpen, Trash2, ChevronDown, Plus } from 'lucide-react';

interface SurveySummary {
    survey_id: string;
    title: string;
}

type SortOrder = 'newest' | 'oldest';

export default function AIReportsPage() {
    const { jwt } = useAuth();
    const api = new GeneratedReportsClient(import.meta.env.VITE_API_URL, {
        fetch: (u, i) => fetch(u, {
            ...i,
            headers: { ...i?.headers, Authorization: `Bearer ${jwt}` }
        })
    });

    const [reports, setReports] = useState<GeneratedReportDto[]>([]);
    const [modalReport, setModalReport] = useState<GeneratedReportDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [surveys, setSurveys] = useState<SurveySummary[]>([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');

    const load = () => {
        setLoading(true);
        api.getAll()
            .then(r => setReports(r ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_AI_URL}/reports/summary`, {
            headers: { Authorization: `Bearer ${jwt}` }
        })
            .then(res => res.json())
            .then(data => setSurveys(data.surveys));
    }, []);

    const handleGenerate = async () => {
        if (!selectedSurveyId) return alert('Please select a survey');
        const res = await fetch(`${import.meta.env.VITE_API_AI_URL}/reports/generate?survey_id=${selectedSurveyId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const err = await res.text();
            alert('Failed to generate report: ' + err);
        } else {
            alert('Report successfully generated!');
            load();
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id || !confirm('Are you sure you want to delete this report?')) return;
        await api.delete(id);
        load();
        if (modalReport?.id === id) setModalReport(null);
    };

    const sorted = useMemo(() => {
        return [...reports].sort((a, b) => {
            const da = new Date(a.generatedAt!).getTime();
            const db = new Date(b.generatedAt!).getTime();
            return sortOrder === 'newest' ? db - da : da - db;
        });
    }, [reports, sortOrder]);

    return (
        <div className="p-6">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h1 className="text-3xl font-extrabold flex items-center gap-2 text-primary">
                    <FileText size={28}/> AI Reports
                </h1>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex gap-2 items-center">
                        <select className="select select-bordered select-sm w-48" value={selectedSurveyId} onChange={e => setSelectedSurveyId(e.target.value)}>
                            <option value="">Select survey...</option>
                            {surveys.map(s => (
                                <option key={s.survey_id} value={s.survey_id}>{s.title}</option>
                            ))}
                        </select>
                        <button className="btn btn-primary btn-sm gap-2" onClick={handleGenerate}>
                            <Plus size={16}/> Generate
                        </button>
                    </div>
                    <div className="dropdown">
                        <button tabIndex={0} className="btn btn-outline btn-sm gap-1">
                            {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'} <ChevronDown size={16}/>
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                            <li><a className={sortOrder === 'newest' ? 'font-bold' : ''} onClick={() => setSortOrder('newest')}>Newest first</a></li>
                            <li><a className={sortOrder === 'oldest' ? 'font-bold' : ''} onClick={() => setSortOrder('oldest')}>Oldest first</a></li>
                        </ul>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-12">
                    <span className="loading loading-spinner loading-lg"/>
                </div>
            ) : sorted.length === 0 ? (
                <div className="text-center text-lg opacity-60">— No reports yet —</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map(r => (
                        <div key={r.id} className="card bg-base-100 shadow-md rounded-xl overflow-hidden transition hover:shadow-xl hover:-translate-y-1">
                            <div className="h-1 bg-primary"/>
                            <div className="card-body flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="badge badge-outline">#{r.id}</span>
                                    <span className="text-xs opacity-60">{new Date(r.generatedAt!).toLocaleDateString()}</span>
                                </div>
                                <p className="flex-1 text-sm mb-4 line-clamp-5 break-words">{r.reportText?.slice(0, 200) ?? ''}…</p>
                                <div className="flex gap-2 mt-auto">
                                    <button className="btn btn-sm btn-outline flex-1 flex items-center gap-1" onClick={() => setModalReport(r)}>
                                        <BookOpen size={16}/> Read
                                    </button>
                                    <button className="btn btn-sm btn-error flex items-center gap-1" onClick={() => handleDelete(r.id)}>
                                        <Trash2 size={16}/> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalReport && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-4xl max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <BookOpen size={20}/> Report #{modalReport.id}
                            </h3>
                            <button className="btn btn-sm btn-error flex items-center gap-1" onClick={() => handleDelete(modalReport.id)}>
                                <Trash2 size={16}/> Delete
                            </button>
                        </div>
                        <div className="prose prose-sm lg:prose-lg max-w-none">
                            {modalReport.reportText?.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setModalReport(null)}>Close</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
