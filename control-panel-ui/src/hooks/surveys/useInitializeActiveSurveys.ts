import {useEffect, useState} from "react";
import {http} from "../../helpers";
import {SurveyResponseDto} from "../../api";
import toast from "react-hot-toast";

export function useInitializeActiveSurveys() {
    const [surveys, setSurveys] = useState<SurveyResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try{
            http.userSurveys.getActiveSurveys()
                .then(r => {
                    setSurveys(r);
                })
        } catch (e) {
            toast.error("Failed to load surveys: " + e);
        } finally {
            setLoading(false);
        }
    }, []);

    return { surveys, loading };
}