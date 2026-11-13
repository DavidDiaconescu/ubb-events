package ro.ubb.events.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import ro.ubb.events.config.AuthProperties;

import java.util.List;
import java.util.Locale;

/**
 * Created by Spring's constraint validator factory, so the allowed domains are injected from configuration.
 */
public class UbbEmailValidator implements ConstraintValidator<UbbEmail, String> {

    private final List<String> allowedDomains;

    public UbbEmailValidator(AuthProperties authProperties) {
        this.allowedDomains = authProperties.allowedEmailDomains().stream()
                .map(domain -> domain.trim().toLowerCase(Locale.ROOT))
                .toList();
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) {
            return true;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        int at = normalized.lastIndexOf('@');
        if (at < 0) {
            return false;
        }
        // Exact domain match: "x@evil-ubbcluj.ro" or "x@ubbcluj.ro.evil.com" are rejected
        return allowedDomains.contains(normalized.substring(at + 1));
    }
}