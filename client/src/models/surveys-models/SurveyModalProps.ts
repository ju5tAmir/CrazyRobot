import {SurveyResponseDto} from "../../api";

export interface SurveyModalProps {
    survey: SurveyResponseDto;
    onClose: () => void;
    onComplete: () => void;
}