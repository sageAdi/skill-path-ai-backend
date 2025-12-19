export declare class AnswerDto {
    questionId: string;
    selectedAnswer: number;
}
export declare class SubmitAssessmentDto {
    assessmentId: string;
    answers: AnswerDto[];
}
