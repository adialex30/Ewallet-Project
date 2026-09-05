package com.vois.simpleewalletsystem.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigInteger;

public class NominalValidator implements ConstraintValidator<ValidNominal, String> {

    @Value("${app.transaction.max-amount:100000000}")
    private long maxAmount;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        context.disableDefaultConstraintViolation();

        if (value == null || value.isBlank()) {
            context.buildConstraintViolationWithTemplate("Nominal tidak boleh kosong.")
                    .addConstraintViolation();
            return false;
        }

        String trimmed = value.trim();

        // Only digits allowed: rejects symbols, letters, decimal points, negative signs.
        if (!trimmed.matches("\\d+")) {
            context.buildConstraintViolationWithTemplate("Nominal harus berupa angka.")
                    .addConstraintViolation();
            return false;
        }

        BigInteger numeric = new BigInteger(trimmed);

        if (numeric.compareTo(BigInteger.ZERO) <= 0) {
            context.buildConstraintViolationWithTemplate("Nominal harus lebih besar dari 0.")
                    .addConstraintViolation();
            return false;
        }

        if (numeric.compareTo(BigInteger.valueOf(maxAmount)) > 0) {
            context.buildConstraintViolationWithTemplate("Nominal melebihi batas maksimum transaksi.")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
