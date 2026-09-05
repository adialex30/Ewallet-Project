package com.vois.simpleewalletsystem.service.impl;

import com.midtrans.httpclient.error.MidtransError;
import com.midtrans.service.MidtransCoreApi;
import com.midtrans.service.MidtransSnapApi;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.exception.PaymentGatewayException;
import com.vois.simpleewalletsystem.service.MidtransService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MidtransServiceImpl implements MidtransService {

    private final MidtransSnapApi midtransSnapApi;
    private final MidtransCoreApi midtransCoreApi;

    @Override
    public JSONObject createSnapTransaction(String orderId, String amount, User user) {

        Map<String, Object> transactionDetails = new HashMap<>();
        transactionDetails.put("order_id", orderId);
        transactionDetails.put("gross_amount", amount);

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("first_name", user.getFullName());
        customerDetails.put("email", user.getEmail());
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            customerDetails.put("phone", user.getPhoneNumber());
        }

        Map<String, Object> params = new HashMap<>();
        params.put("transaction_details", transactionDetails);
        params.put("customer_details", customerDetails);

        try {
            return midtransSnapApi.createTransaction(params);
        } catch (MidtransError e) {
            log.error("Midtrans createTransaction failed for order {}: {}", orderId, e.getMessage());
            throw new PaymentGatewayException("Failed to create top up transaction with Midtrans", e);
        }
    }

    @Override
    public JSONObject checkTransactionStatus(String orderId) {
        try {
            return midtransCoreApi.checkTransaction(orderId);
        } catch (MidtransError e) {
            log.error("Midtrans checkTransaction failed for order {}: {}", orderId, e.getMessage());
            throw new PaymentGatewayException("Failed to check transaction status with Midtrans", e);
        }
    }
}
