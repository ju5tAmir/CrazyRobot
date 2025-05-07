import {SurveyResponseDto} from "../../api/generated-client.ts";

export interface SurveyCardProps {
    survey: SurveyResponseDto;
    onEdit?: (survey: SurveyResponseDto) => void;
    onDelete?: (id?: string) => void;
}