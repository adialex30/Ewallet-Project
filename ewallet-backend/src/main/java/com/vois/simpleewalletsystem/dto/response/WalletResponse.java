package com.vois.simpleewalletsystem.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Long id;
    private BigDecimal balance;
    private Long version;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}