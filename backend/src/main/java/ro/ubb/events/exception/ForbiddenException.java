package ro.ubb.events.exception;

/**
 * Thrown when the authenticated user is not allowed to perform an operation (R2). Translated to HTTP 403.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
