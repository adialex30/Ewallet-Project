package com.vois.simpleewalletsystem.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NominalValidator.class)
public @interface ValidNominal {

    String message() default "Nominal tidak valid.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
