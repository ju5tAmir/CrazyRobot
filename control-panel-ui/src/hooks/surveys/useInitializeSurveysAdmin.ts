import {useEffect, useState} from "react";
import {http} from "../../helpers";
import {SurveyResponseDto} from "../../api";
import toast from "react-hot-toast";

export function useInitializeSurveysAdmin() {
    const [surveys, setSurveys] = useState<SurveyResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try{
            http.adminSurveys.getAllSurveys()
                .then(r => {
                    setSurveys(Array.isArray(r) ? r : [r]);
                })
        } catch (e) {
            toast.error("An unexpected error occurred: " + e);
        } finally {
            setLoading(false);

        }
    }, []);

    return { surveys, loading, setLoading, setSurveys };
}