import {SurveyResponseDto} from "../../api/generated-client.ts";

export interface SurveyModalProps {
    survey: SurveyResponseDto;
    onClose: () => void;
    onComplete: () => void;
}