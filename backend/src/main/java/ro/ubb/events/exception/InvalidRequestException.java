package ro.ubb.events.exception;

/**
 * Thrown when a request is well-formed but its values are inconsistent
 * (for example, an event that ends before it starts). Translated to HTTP 400.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
