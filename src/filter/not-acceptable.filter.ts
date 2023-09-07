import { ExceptionFilter, Catch, ArgumentsHost, NotAcceptableException } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotAcceptableException)
export class AcceptableExceptionFilter implements ExceptionFilter {
    catch(exception: NotAcceptableException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const outcome = {
            actionStatus: false,
            message: (exception.getResponse() as any).error
        }
        response
            .json(outcome)
    }
}