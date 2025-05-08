import {SurveyResponseDto} from "../../api/generated-client.ts";

export interface UserSurveyCardProps {
    survey: SurveyResponseDto;
    onTakeSurvey: (survey: SurveyResponseDto) => void;
}