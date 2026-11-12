package ro.ubb.events.exception;

/**
 * Thrown when a request conflicts with the current state of the system
 * (duplicates, operations not allowed in the current status, etc.). Translated to HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
