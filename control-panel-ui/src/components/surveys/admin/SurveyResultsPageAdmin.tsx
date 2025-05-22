import { useState } from 'react';
import Loading from '../../../shared/Loading.tsx';
import Pagination from '../../../shared/Pagination.tsx';
import {useSurveyResults} from "../../../hooks";
import { QuestionResultDto, AnswerStatisticDto } from '../../../api';


export default function SurveyResultsPageAdmin() {
    const { surveyResults, loading, selectedSurvey, setSelectedSurvey } = useSurveyResults();
    const [currentPage, setCurrentPage] = useState(1);
    const answersPerPage = 5;


    function renderBarChart(questionResult: QuestionResultDto) {
        if (!questionResult.statistics || questionResult.statistics.length === 0) {
            return <p className="text-center text-sm italic">No data available</p>;
        }

        return (
            <div className="mt-3">
                {questionResult.statistics.map((stat: AnswerStatisticDto, index: number) => (
                    <div key={index} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span>{stat.optionText}</span>
                            <span>{stat.count} ({Math.round(stat.percentage as number)}%)</span>
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

                        {/* Surveys List */}
                        <div className="md:w-1/3">
                            <div className="bg-base-100 rounded-lg p-4 shadow-sm">
                                <h2 className="text-lg font-medium mb-4">Surveys</h2>
                                <div className="space-y-2">
                                    {surveyResults.map(survey => (
                                        <div
                                            key={survey.surveyId}
                                            onClick={() => setSelectedSurvey(survey)}
                                            className={`p-3 rounded-lg cursor-pointer transition-transform hover:scale-105 hover:bg-base-200 ${selectedSurvey?.surveyId === survey.surveyId ? 'bg-base-200' : ''}`}
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

                        {/* Survey Results */}
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

                                    {(selectedSurvey.totalResponses ?? 0) > 0 ? (
                                        <div className="space-y-6">
                                            {selectedSurvey.questionResults?.map((question, i) => (
                                                <div key={i} className="card bg-base-200 p-4">
                                                    <h3 className="font-medium">
                                                        {i + 1}. {question.questionText}
                                                    </h3>
                                                    <p className="text-sm opacity-70">Type: {question.questionType}</p>

                                                    {question.questionType === 'text' ? (
                                                        <div className="mt-2 text-sm italic">
                                                            {question.statistics?.slice((currentPage - 1) * answersPerPage, currentPage * answersPerPage)
                                                                .map((answer, i) => (
                                                                    <div key={i} className="card bg-base-200 p-4 mb-2">
                                                                        <h1 className="font-medium">
                                                                            {((currentPage - 1) * answersPerPage) + i + 1}. {answer.optionText}
                                                                        </h1>
                                                                    </div>
                                                                ))}
                                                            <Pagination
                                                                total={(question.statistics?.length ?? 0)}
                                                                current={currentPage}
                                                                onPageChange={setCurrentPage}
                                                                answersPerPage={answersPerPage}
                                                            />
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