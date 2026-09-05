package com.vois.simpleewalletsystem.dto.request;

import com.vois.simpleewalletsystem.validation.ValidNominal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopupRequest {

    @ValidNominal
    private String amount;
}
