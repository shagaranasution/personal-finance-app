import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const body = exception instanceof HttpException ? exception.getResponse() : undefined
    const message =
      status === 404
        ? 'Route not found'
        : typeof body === 'string'
          ? body
          : body && typeof body === 'object' && 'message' in body
            ? body.message
            : 'Internal server error'
    if (status >= 500) this.logger.error(`Request failed with status ${status}`)
    response
      .status(status)
      .json({ statusCode: status, message, path: request.originalUrl.split('?')[0] })
  }
}
