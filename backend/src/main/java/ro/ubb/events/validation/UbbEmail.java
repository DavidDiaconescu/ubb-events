package ro.ubb.events.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * BR-28: the e-mail address must belong to one of the institutional domains
 * configured in {@code app.auth.allowed-email-domains}. {@code null} is considered valid
 * (combine with {@code @NotBlank}).
 */
@Documented
@Constraint(validatedBy = UbbEmailValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface UbbEmail {

    String message() default "Adresa de e-mail trebuie să fie una instituțională UBB";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
