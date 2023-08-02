import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class QueryExceptionFilter implements ExceptionFilter<QueryFailedError> {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    switch (parseInt(exception.code)) {
      case 23505:
        return response.status(409).json({
          error: 'Duplicate constraint key',
          detail: exception.detail,
        });
      default:
        return response.status(500).json({
          error: 'Internal Server Error',
          message: exception.message,
        });
    }
  }
}
