import {useEffect, useState} from "react";
import {http} from "../../helpers";
import {SurveyResultsDto} from "../../api";
import toast from "react-hot-toast";

export function useSurveyResults() {
    const [surveyResults, setSurveyResults] = useState<SurveyResultsDto[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyResultsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        try{
            http.adminSurveys.getSurveysResults()
                .then(r => {
                    setSurveyResults(r);
                    if (r.length > 0) {
                        setSelectedSurvey(r[0]);
                    }
                })
        } catch (e) {
            toast.error("Failed to load survey results: " + e);
        } finally {
            setLoading(false);
        }
    }, []);

    return { surveyResults, loading, selectedSurvey, setSelectedSurvey };
}