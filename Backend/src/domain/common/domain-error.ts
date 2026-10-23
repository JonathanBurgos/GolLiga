export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} no existe.`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class ForbiddenDomainError extends DomainError {
  constructor(message: string) {
    super(message, 'FORBIDDEN', 403);
  }
}
