package com.vois.simpleewalletsystem.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class TopupResponse {

    private String orderId;
    private String snapToken;
    private String redirectUrl;
    private BigDecimal amount;
    private String status;
}
