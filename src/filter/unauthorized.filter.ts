import { ExceptionFilter, Catch, ArgumentsHost, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const outcome = {
            actionStatus: false,
            message: 'Użytkonik nie zalogowonay'
        }
        response
            .json(outcome)
    }
}