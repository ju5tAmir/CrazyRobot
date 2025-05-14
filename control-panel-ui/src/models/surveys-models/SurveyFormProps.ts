import {CreateSurveyRequestDto} from "../../api/generated-client.ts";

export interface SurveyFormProps {
    initial?: CreateSurveyRequestDto;
    onSubmit(dto: CreateSurveyRequestDto): void;
    onCancel: () => void;
}