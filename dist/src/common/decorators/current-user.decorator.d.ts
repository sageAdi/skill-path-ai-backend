export interface CurrentUserPayload {
    id: string;
    email: string;
    role: string;
    learningRole: string | null;
}
export interface RequestWithUser {
    user?: CurrentUserPayload;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
