import {SurveyResponseDto} from "../../api";

export interface UserSurveyCardProps {
    survey: SurveyResponseDto;
    onTakeSurvey: (survey: SurveyResponseDto) => void;
}