import toast from "react-hot-toast";

export interface ValidationError {
    [field: string]: string[]
}

export interface ErrorResponse {
    title: string;
    status: number;
    errors: ValidationError;
}

export const showErrorToasts = (errors: ValidationError | null) => {
    if (!errors) return;
    Object.values(errors.errors).flat().forEach((msg) => {
        if (msg) toast.error(msg);
    });
};