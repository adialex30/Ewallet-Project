package com.vois.simpleewalletsystem.mapper;

import com.vois.simpleewalletsystem.dto.response.WalletBalanceResponse;
import com.vois.simpleewalletsystem.dto.response.WalletResponse;
import com.vois.simpleewalletsystem.entity.Wallet;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletResponse toResponse(Wallet wallet) {

        return WalletResponse.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .version(wallet.getVersion())
                .userId(wallet.getUser().getId())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    public WalletBalanceResponse toBalanceResponse(Wallet wallet) {

        return WalletBalanceResponse.builder()
                .walletId(wallet.getId())
                .balance(wallet.getBalance())
                .build();
    }
}