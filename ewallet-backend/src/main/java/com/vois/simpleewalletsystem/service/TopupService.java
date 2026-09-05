package com.vois.simpleewalletsystem.service;

import com.vois.simpleewalletsystem.dto.request.TopupRequest;
import com.vois.simpleewalletsystem.dto.response.TopupResponse;

import java.util.Map;

public interface TopupService {

    TopupResponse initiateTopup(TopupRequest request, String userEmail);
    void handleNotification(Map<String, Object> payload);
}
