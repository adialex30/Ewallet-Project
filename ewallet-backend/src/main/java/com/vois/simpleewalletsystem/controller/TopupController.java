package com.vois.simpleewalletsystem.controller;

import com.vois.simpleewalletsystem.dto.request.TopupRequest;
import com.vois.simpleewalletsystem.dto.response.TopupResponse;
import com.vois.simpleewalletsystem.service.TopupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/topup")
@RequiredArgsConstructor
@Tag(name = "Topup", description = "Wallet top up via Midtrans Snap")
public class TopupController {

    private final TopupService topupService;

    @Operation(
            summary = "Create a top up transaction",
            description = "Creates a Midtrans Snap transaction for the current user's wallet. "
                    + "Returns a snapToken (for Snap.js popup) and a redirectUrl (Snap Redirect page). "
                    + "The wallet is only credited once /api/topup/notification confirms payment."
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TopupResponse> topup(
            @Valid @RequestBody TopupRequest request,
            Authentication authentication) {

        TopupResponse response = topupService.initiateTopup(request, authentication.getName());

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Midtrans webhook",
            description = "Public endpoint Midtrans calls whenever a transaction's status changes. "
                    + "Do not call this directly - it is not authenticated with a JWT, it verifies "
                    + "the notification by re-querying Midtrans directly with the server key."
    )
    @PostMapping("/notification")
    public ResponseEntity<String> notification(@RequestBody Map<String, Object> payload) {

        topupService.handleNotification(payload);

        return ResponseEntity.ok("OK");
    }
}
