import { useState, useEffect } from 'react';
import { useAuth } from '../../../SchoolInfo/auth/AuthContext.tsx';
import { AdminSurveysClient, SurveyResultsDto } from '../../../api/generated-client.ts';
import Loading from '../../../shared/Loading.tsx';

export default function SurveyResultsAdmin() {
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

    const [surveyResults, setSurveyResults] = useState<SurveyResultsDto[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyResultsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSurveyResults();
    }, []);

    async function loadSurveyResults() {
        try {
            setLoading(true);
            const results = await client.getSurveysResults();
            setSurveyResults(results);
            if (results.length > 0) {
                setSelectedSurvey(results[0]);
            }
        } catch (error) {
            console.error("Failed to load survey results:", error);
        } finally {
            setLoading(false);
        }
    }

    function renderBarChart(questionResult: any) {
        if (!questionResult.statistics || questionResult.statistics.length === 0) {
            return <p className="text-center text-sm italic">No data available</p>;
        }

        return (
            <div className="mt-3">
                {questionResult.statistics.map((stat: any, index: number) => (
                    <div key={index} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span>{stat.optionText}</span>
                            <span>{stat.count} ({Math.round(stat.percentage)}%)</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${stat.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Survey Results</h1>

            {loading ? (
                <Loading />
            ) : (
                surveyResults.length > 0 ? (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/3">
                            <div className="bg-base-100 rounded-lg p-4 shadow-sm">
                                <h2 className="text-lg font-medium mb-4">Surveys</h2>
                                <div className="space-y-2">
                                    {surveyResults.map(survey => (
                                        <div
                                            key={survey.surveyId}
                                            onClick={() => setSelectedSurvey(survey)}
                                            className={`p-3 rounded-lg cursor-pointer hover:bg-base-200 ${selectedSurvey?.surveyId === survey.surveyId ? 'bg-base-200' : ''}`}
                                        >
                                            <h3 className="font-medium">{survey.title}</h3>
                                            <div className="text-sm opacity-70">
                                                {survey.totalResponses} responses
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            {selectedSurvey ? (
                                <div className="bg-base-100 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-medium">{selectedSurvey.title}</h2>
                                            <p className="text-sm opacity-70">
                                                Total responses: {selectedSurvey.totalResponses}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedSurvey.totalResponses > 0 ? (
                                        <div className="space-y-6">
                                            {selectedSurvey.questionResults?.map((question, i) => (
                                                <div key={i} className="card bg-base-200 p-4">
                                                    <h3 className="font-medium">
                                                        {i + 1}. {question.questionText}
                                                    </h3>
                                                    <p className="text-sm opacity-70">Type: {question.questionType}</p>

                                                    {question.questionType === 'Text' ? (
                                                        <div className="mt-2 text-sm italic">
                                                            Text responses are shown individually per submission
                                                        </div>
                                                    ) : (
                                                        renderBarChart(question)
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8">
                                            <p className="text-lg">No responses yet</p>
                                            <p className="text-sm opacity-70">Responses will appear here once users complete the survey</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <p>Select a survey to view results</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <p className="text-lg">No survey results available</p>
                        <p className="text-sm opacity-70">Create surveys and collect responses to see results here</p>
                    </div>
                )
            )}
        </>
    );
}