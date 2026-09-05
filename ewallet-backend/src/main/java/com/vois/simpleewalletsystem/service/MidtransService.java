package com.vois.simpleewalletsystem.service;

import com.vois.simpleewalletsystem.entity.User;
import org.json.JSONObject;

public interface MidtransService {

    JSONObject createSnapTransaction(String orderId, String amount, User user);
    JSONObject checkTransactionStatus(String orderId);
}
