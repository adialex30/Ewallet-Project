package com.vois.simpleewalletsystem.service;

import com.vois.simpleewalletsystem.dto.request.TransferRequest;
import com.vois.simpleewalletsystem.dto.request.WithdrawalRequest;
import com.vois.simpleewalletsystem.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse withdraw(WithdrawalRequest request, String userEmail);
    TransactionResponse transfer(TransferRequest request, String userEmail);
    List<TransactionResponse> getMyTransactionHistory(String userEmail);
    List<TransactionResponse> getTransactionHistory(Long walletId);
    List<TransactionResponse> getAllTransactions();
    TransactionResponse getTransactionById(Long transactionId);
}
