import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Type for the user object attached to the request by JWT strategy
export interface CurrentUserPayload {
  id: string;
  email: string;
  role: string;
  learningRole: string | null;
}

// Request object with user property
export interface RequestWithUser {
  user?: CurrentUserPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
