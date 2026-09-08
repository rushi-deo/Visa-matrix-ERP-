export type Result<T, E = Error> = Success<T> | Failure<E>;

export type Success<T> = Readonly<{
  isSuccess: true;
  isFailure: false;
  value: T;
}>;

export type Failure<E = Error> = Readonly<{
  isSuccess: false;
  isFailure: true;
  error: E;
}>;

export const success = <T>(value: T): Success<T> => ({
  isSuccess: true,
  isFailure: false,
  value,
});

export const createOkResult = success;

export const failure = <E>(error: E): Failure<E> => ({
  isSuccess: false,
  isFailure: true,
  error,
});

export const createErrResult = failure;

export const mapResult = <T, E, U>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> =>
  result.isSuccess ? success(mapper(result.value)) : result;

export const flatMapResult = <T, E, U>(
  result: Result<T, E>,
  mapper: (value: T) => Result<U, E>,
): Result<U, E> => (result.isSuccess ? mapper(result.value) : result);

export const matchResult = <T, E, R>(
  result: Result<T, E>,
  branches: Readonly<{
    success: (value: T) => R;
    failure: (error: E) => R;
  }>,
): R => (result.isSuccess ? branches.success(result.value) : branches.failure(result.error));
