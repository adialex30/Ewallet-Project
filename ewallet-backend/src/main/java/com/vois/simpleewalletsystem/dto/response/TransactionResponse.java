package com.vois.simpleewalletsystem.dto.response;

import com.vois.simpleewalletsystem.enums.TransactionStatus;
import com.vois.simpleewalletsystem.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionStatus status;
    private LocalDateTime createdAt;
    private Long sourceWalletId;
    private Long destinationWalletId;
    private String sourceUserFullName;
    private String sourceUserEmail;
    private String destinationUserFullName;
    private String destinationUserEmail;

    private String orderId;
    private String paymentType;
}