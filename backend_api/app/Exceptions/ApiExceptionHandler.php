<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\{
    AccessDeniedHttpException,
    HttpException,
    MethodNotAllowedHttpException,
    NotFoundHttpException
};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ApiExceptionHandler
{
    /**
     * Map of exception classes to their handler methods
     */
    public static array $handlers = [
        AuthenticationException::class       => 'handleAuthenticationException',
        AccessDeniedHttpException::class     => 'handleAuthenticationException',
        AuthorizationException::class        => 'handleAuthorizationException',
        ValidationException::class           => 'handleValidationException',
        ModelNotFoundException::class        => 'handleNotFoundException',
        NotFoundHttpException::class         => 'handleNotFoundException',
        MethodNotAllowedHttpException::class => 'handleMethodNotAllowedException',
        HttpException::class                 => 'handleHttpException',
        QueryException::class                => 'handleQueryException',
    ];

    /**
     * Handle authentication exceptions
     */
    public function handleAuthenticationException(AuthenticationException|AccessDeniedHttpException $e, Request $request): JsonResponse
    {
        logError('Authentication failed', [], $e);

        return errorException(
            type: getClassName($e),
            status: 401,
            message: 'Authentication required. Please provide valid credentials.'
        );
    }

    /**
     * Handle authorization exceptions
     */
    public function handleAuthorizationException(AuthorizationException $e, Request $request): JsonResponse
    {
        logError('Authorization failed', [], $e);

        return errorException(
            type: getClassName($e), 
            status: 403,
            message: 'You do not have permission to perform this action.'
        );
    }

    /**
     * Handle validation exceptions
     */
    public function handleValidationException(ValidationException $e, Request $request): JsonResponse
    {
        $errors = collect($e->errors())->flatMap(fn ($messages, $field) =>
            collect($messages)->map(fn ($msg) => ['field' => $field, 'message' => $msg])
        )->values()->toArray();

        logError('Validation failed', ['errors' => $errors], $e);

        return errorException(
            type: getClassName($e),
            status: 422,
            message: 'The provided data is invalid.',
            extra: ['validation_errors' => $errors]
        );
    }

    /**
     * Handle not found exceptions
     */
    public function handleNotFoundException(ModelNotFoundException|NotFoundHttpException $e, Request $request): JsonResponse
    {
        logError('Resource not found', [], $e);

        // default message
        $message = 'The requested resource was not found.';

        // jika ModelNotFoundException → ambil nama model-nya
        if ($e instanceof ModelNotFoundException) {
            $modelClass = $e->getModel();

            if ($modelClass) {
                $modelName = class_basename($modelClass); // contoh: "Account"
                $modelName = str($modelName)->snake(' ')->title(); // jadi "Account"
                $message = "{$modelName} not found.";
            }
        }

        // jika endpoint gak ada
        elseif ($e instanceof NotFoundHttpException) {
            $message = "The requested endpoint '{$request->getRequestUri()}' was not found.";
        }

        return errorException(
            type: getClassName($e),
            status: 404,
            message: $message
        );
    }


    /**
     * Handle method not allowed exceptions
     */
    public function handleMethodNotAllowedException(MethodNotAllowedHttpException $e, Request $request): JsonResponse
    {
        logError('Method not allowed', [], $e);

        return errorException(
            type: getClassName($e),
            status: 405,
            message: "The {$request->method()} method is not allowed for this endpoint.",
            extra: ['allowed_methods' => $e->getHeaders()['Allow'] ?? 'Unknown']
        );
    }

    /**
     * Handle general HTTP exceptions
     */
    public function handleHttpException(HttpException $e, Request $request): JsonResponse
    {
        logError('HTTP exception occurred', [], $e);

        return errorException(
            type: getClassName($e),
            status: $e->getStatusCode(),
            message: $e->getMessage() ?: 'An HTTP error occurred.'
        );
    }

    /**
     * Handle database query exceptions
     */
    public function handleQueryException(QueryException $e, Request $request): JsonResponse
    {
        logError('Database query failed', ['sql' => $e->getSql()], $e);

        $errorCode = $e->errorInfo[1] ?? null;

        return match ($errorCode) {
            1451 => errorException(
                type: getClassName($e),
                status: 409,
                message: 'Cannot delete this resource because it is referenced by other records.'
            ),
            1062 => errorException(
                type: getClassName($e),
                status: 409,
                message: 'A record with this information already exists.'
            ),
            default => errorException(
                type: getClassName($e),
                status: 500,
                message: 'A database error occurred. Please try again later.'
            ),
        };
    }
}
