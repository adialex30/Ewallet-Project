package com.vois.simpleewalletsystem.controller;

import com.vois.simpleewalletsystem.dto.request.TransferRequest;
import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
import com.vois.simpleewalletsystem.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfer")
@RequiredArgsConstructor
@Tag(name = "Transfer", description = "Balance transfer between users")
public class TransferController {

    private final TransactionService transactionService;

    @Operation(
            summary = "Transfer balance to another user",
            description = "Transfers from the current user's own wallet to a recipient identified "
                    + "by email or phone number. Runs inside a single @Transactional boundary so a "
                    + "failure crediting the recipient rolls back the sender's deduction."
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication) {

        TransactionResponse response = transactionService.transfer(request, authentication.getName());

        return ResponseEntity.ok(response);
    }
}
