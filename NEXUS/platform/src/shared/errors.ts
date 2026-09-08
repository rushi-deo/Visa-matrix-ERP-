export type ErrorMetadata = Readonly<Record<string, unknown>>;

export type ApplicationErrorOptions = Readonly<{
  code: string;
  status: number;
  metadata: ErrorMetadata | undefined;
  cause: unknown | undefined;
}>;

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly metadata: ErrorMetadata | undefined;
  public override readonly cause: unknown | undefined;

  public constructor(message: string, options: ApplicationErrorOptions) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.status = options.status;
    this.metadata = options.metadata;
    this.cause = options.cause;
  }
}

export class ValidationError extends ApplicationError {
  public constructor(message = 'Validation failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'VALIDATION_ERROR',
      status: options.status ?? 400,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class AuthenticationError extends ApplicationError {
  public constructor(message = 'Authentication failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'AUTHENTICATION_ERROR',
      status: options.status ?? 401,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class AuthorizationError extends ApplicationError {
  public constructor(message = 'Authorization failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'AUTHORIZATION_ERROR',
      status: options.status ?? 403,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class ConfigurationError extends ApplicationError {
  public constructor(message = 'Configuration failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'CONFIGURATION_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class IntegrationError extends ApplicationError {
  public constructor(message = 'Integration failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'INTEGRATION_ERROR',
      status: options.status ?? 502,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class EngineError extends ApplicationError {
  public constructor(message = 'Engine failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'ENGINE_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class KnowledgeError extends ApplicationError {
  public constructor(message = 'Knowledge operation failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'KNOWLEDGE_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class MemoryError extends ApplicationError {
  public constructor(message = 'Memory operation failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'MEMORY_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class WorkflowError extends ApplicationError {
  public constructor(message = 'Workflow operation failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'WORKFLOW_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}

export class AIError extends ApplicationError {
  public constructor(message = 'AI operation failed', options: Partial<ApplicationErrorOptions> = {}) {
    super(message, {
      code: options.code ?? 'AI_ERROR',
      status: options.status ?? 500,
      metadata: options.metadata,
      cause: options.cause,
    });
  }
}
