package com.vois.simpleewalletsystem.controller;

import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
import com.vois.simpleewalletsystem.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * NOTE: deposit/withdraw/transfer are no longer exposed from this controller.
 * They now live in their own dedicated, ID-less, current-user-scoped
 * endpoints: TopupController (/api/topup), WalletController (/api/wallet/withdraw),
 * and TransferController (/api/transfer) - matching the Mini Wallet API spec,
 * which resolves the acting wallet from the JWT rather than a path variable.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction history (mutasi)")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(
            summary = "Get my transaction history",
            description = "Returns the current authenticated user's own transaction history (mutasi)."
    )
    @GetMapping("/api/transactions")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getMyTransactionHistory(
            Authentication authentication) {

        return ResponseEntity.ok(
                transactionService.getMyTransactionHistory(authentication.getName())
        );
    }

    @Operation(
            summary = "Get all transactions (admin monitoring)",
            description = "System-wide activity log across every user's wallet. ADMIN only - "
                    + "this is what lets an admin monitor user activity, since GET /api/transactions "
                    + "only ever returns the caller's own history."
    )
    @GetMapping("/api/transactions/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {

        return ResponseEntity.ok(
                transactionService.getAllTransactions()
        );
    }

    @Operation(
            summary = "Get transaction history by wallet ID (admin/owner)",
            description = "ADMIN can inspect any wallet's history; a regular USER can only access their own."
    )
    @GetMapping("/api/wallet/{walletId}/transactions")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(
            @PathVariable Long walletId) {

        return ResponseEntity.ok(
                transactionService.getTransactionHistory(walletId)
        );
    }

    @Operation(
            summary = "Get transaction by ID",
            description = "Only the sender, the recipient, or an ADMIN may view a given transaction."
    )
    @GetMapping("/api/transactions/{transactionId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long transactionId) {

        return ResponseEntity.ok(
                transactionService.getTransactionById(transactionId)
        );
    }
}
