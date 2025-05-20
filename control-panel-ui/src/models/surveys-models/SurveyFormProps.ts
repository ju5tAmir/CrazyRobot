import {CreateSurveyRequestDto} from "../../api";

export interface SurveyFormProps {
    initial?: CreateSurveyRequestDto;
    onSubmit(dto: CreateSurveyRequestDto): void;
    onCancel: () => void;
}