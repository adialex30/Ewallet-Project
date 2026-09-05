package com.vois.simpleewalletsystem.dto.request;

import com.vois.simpleewalletsystem.validation.ValidNominal;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferRequest {

    @ValidNominal
    private String amount;

    @NotBlank(message = "Recipient (email or phone number) is required")
    private String recipient;
}
