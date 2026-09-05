package com.vois.simpleewalletsystem.controller;

import com.vois.simpleewalletsystem.dto.request.WithdrawalRequest;
import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
import com.vois.simpleewalletsystem.dto.response.WalletBalanceResponse;
import com.vois.simpleewalletsystem.dto.response.WalletResponse;
import com.vois.simpleewalletsystem.service.TransactionService;
import com.vois.simpleewalletsystem.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Wallet balance and withdrawal")
public class WalletController {

    private final WalletService walletService;
    private final TransactionService transactionService;

    @Operation(summary = "Get my wallet", description = "Returns the current authenticated user's own wallet.")
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<WalletResponse> getMyWallet(Authentication authentication) {

        return ResponseEntity.ok(
                walletService.getMyWallet(authentication.getName())
        );
    }

    @Operation(summary = "Get my balance", description = "Returns the current authenticated user's own balance.")
    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<WalletBalanceResponse> getMyBalance(Authentication authentication) {

        return ResponseEntity.ok(
                walletService.getMyWalletBalance(authentication.getName())
        );
    }

    @Operation(
            summary = "Withdraw from my wallet",
            description = "Withdraws a nominal amount from the current user's own wallet. "
                    + "Fails with 400 if the resulting balance would go negative."
    )
    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TransactionResponse> withdraw(
            @Valid @RequestBody WithdrawalRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                transactionService.withdraw(request, authentication.getName())
        );
    }

    @Operation(
            summary = "Get wallet by ID (admin/owner)",
            description = "ADMIN can inspect any wallet; a regular USER can only access their own."
    )
    @GetMapping("/{walletId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<WalletResponse> getWallet(
            @PathVariable Long walletId,
            Authentication authentication) {

        return ResponseEntity.ok(
                walletService.getWalletById(walletId, authentication.getName())
        );
    }

    @Operation(
            summary = "Get wallet balance by ID (admin/owner)",
            description = "ADMIN can inspect any wallet's balance; a regular USER can only access their own."
    )
    @GetMapping("/{walletId}/balance")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<WalletBalanceResponse> getBalance(
            @PathVariable Long walletId,
            Authentication authentication) {

        return ResponseEntity.ok(
                walletService.getWalletBalance(walletId, authentication.getName())
        );
    }
}
