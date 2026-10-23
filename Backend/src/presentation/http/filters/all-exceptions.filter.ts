import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import { DomainError } from '../../../domain/common/domain-error.js';

interface ApiErrorResponse {
  readonly statusCode: number;
  readonly message: readonly string[];
  readonly code?: string;
}

interface ErrorDetails {
  readonly statusCode: number;
  readonly message: readonly string[];
  readonly code?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<{ method?: string; originalUrl?: string; url?: string }>();
    const response = http.getResponse();
    const details = this.describe(exception);
    const context = {
      err: exception,
      statusCode: details.statusCode,
      method: request.method,
      url: request.originalUrl ?? request.url,
    };

    if (details.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(context, 'Unhandled request exception');
    } else {
      this.logger.warn(context, 'Request rejected');
    }

    if (this.adapterHost.httpAdapter.isHeadersSent(response)) return;

    const body: ApiErrorResponse = {
      statusCode: details.statusCode,
      message: details.message,
      ...(details.code ? { code: details.code } : {}),
    };
    this.adapterHost.httpAdapter.reply(response, body, details.statusCode);
  }

  private describe(exception: unknown): ErrorDetails {
    if (this.isUploadTooLarge(exception)) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: ['El archivo supera el tamaño máximo permitido de 2 GB.'],
        code: 'UPLOAD_TOO_LARGE',
      };
    }

    if (this.isPayloadTooLarge(exception)) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: ['El cuerpo de la solicitud supera el tamaño máximo permitido (2 MB).'],
        code: 'PAYLOAD_TOO_LARGE',
      };
    }

    if (exception instanceof DomainError) {
      if (exception.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.internalError();
      }

      return {
        statusCode: exception.statusCode,
        message: [exception.message],
        code: exception.code,
      };
    }

    const databaseError = this.describeDatabaseError(exception);
    if (databaseError) return databaseError;

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.internalError();
      }

      return {
        statusCode,
        message: this.extractMessages(exception.getResponse(), exception.message),
      };
    }

    return this.internalError();
  }

  private isPayloadTooLarge(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') return false;

    return (
      ('name' in exception && exception.name === 'PayloadTooLargeError')
      || ('status' in exception && exception.status === HttpStatus.PAYLOAD_TOO_LARGE)
    );
  }

  private isUploadTooLarge(exception: unknown): boolean {
    return Boolean(
      exception
      && typeof exception === 'object'
      && 'code' in exception
      && exception.code === 'LIMIT_FILE_SIZE',
    );
  }

  private describeDatabaseError(exception: unknown): ErrorDetails | null {
    if (!exception || typeof exception !== 'object' || !('code' in exception)) return null;

    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'UNIQUE_CONSTRAINT',
          message: ['Ya existe un registro con esos datos únicos.'],
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: ['No se encontró el registro solicitado.'],
        };
      case 'P2003':
      case 'P2014':
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'RELATION_CONSTRAINT',
          message: ['La operación no cumple las relaciones entre datos.'],
        };
      default:
        return null;
    }
  }

  private extractMessages(response: string | object, fallback: string): readonly string[] {
    const value = typeof response === 'string'
      ? response
      : 'message' in response
        ? response.message
        : fallback;

    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
    return typeof value === 'string' ? [value] : [fallback];
  }

  private internalError(): ErrorDetails {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ['Ocurrió un error inesperado.'],
    };
  }
}
