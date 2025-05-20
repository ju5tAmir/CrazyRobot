import {SurveyResponseDto} from "../../api";

export interface SurveyCardProps {
    survey: SurveyResponseDto;
    onEdit?: (survey: SurveyResponseDto) => void;
    onDelete?: (id?: string) => void;
}