import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../domain/common/domain-error.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{ status(code: number): { json(body: unknown): void } }>();
    if (exception instanceof DomainError) {
      return response.status(exception.statusCode).json({ statusCode: exception.statusCode, code: exception.code, message: exception.message });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json({ statusCode: status, message: exception.getResponse() });
    }
    const code = (exception as { code?: string })?.code;
    if (code === 'P2002') return response.status(HttpStatus.CONFLICT).json({ statusCode: 409, code: 'UNIQUE_CONSTRAINT', message: 'Ya existe un registro con esos datos únicos.' });
    if (code === 'P2025') return response.status(HttpStatus.NOT_FOUND).json({ statusCode: 404, code: 'NOT_FOUND', message: 'No se encontró el registro solicitado.' });
    if (code === 'P2003' || code === 'P2014') return response.status(HttpStatus.CONFLICT).json({ statusCode: 409, code: 'RELATION_CONSTRAINT', message: 'La operación no cumple las relaciones entre datos.' });
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: 500, message: 'Ocurrió un error inesperado.' });
  }
}
