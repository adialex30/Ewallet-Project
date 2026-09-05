package com.vois.simpleewalletsystem.service.impl;

import com.vois.simpleewalletsystem.dto.request.TopupRequest;
import com.vois.simpleewalletsystem.dto.response.TopupResponse;
import com.vois.simpleewalletsystem.entity.Transaction;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.entity.Wallet;
import com.vois.simpleewalletsystem.enums.TransactionStatus;
import com.vois.simpleewalletsystem.enums.TransactionType;
import com.vois.simpleewalletsystem.exception.UserNotFoundException;
import com.vois.simpleewalletsystem.exception.WalletNotFoundException;
import com.vois.simpleewalletsystem.repository.TransactionRepository;
import com.vois.simpleewalletsystem.repository.UserRepository;
import com.vois.simpleewalletsystem.repository.WalletRepository;
import com.vois.simpleewalletsystem.service.MidtransService;
import com.vois.simpleewalletsystem.service.TopupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopupServiceImpl implements TopupService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final MidtransService midtransService;

    @Override
    @Transactional
    public TopupResponse initiateTopup(TopupRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = user.getWallet();

        if (wallet == null) {
            throw new WalletNotFoundException("Wallet not found for current user");
        }

        BigDecimal amount = new BigDecimal(request.getAmount());

        String orderId = "TOPUP-" + wallet.getId() + "-" + System.currentTimeMillis()
                + "-" + UUID.randomUUID().toString().substring(0, 8);

        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setAmount(amount);
        transaction.setDestinationWallet(wallet);
        transaction.setOrderId(orderId);

        transactionRepository.save(transaction);

        JSONObject midtransResult = midtransService.createSnapTransaction(orderId, request.getAmount(), user);

        return TopupResponse.builder()
                .orderId(orderId)
                .snapToken(midtransResult.optString("token", null))
                .redirectUrl(midtransResult.optString("redirect_url", null))
                .amount(amount)
                .status(TransactionStatus.PENDING.name())
                .build();
    }

    @Override
    @Transactional
    public void handleNotification(Map<String, Object> payload) {

        Object rawOrderId = payload.get("order_id");

        if (rawOrderId == null) {
            log.warn("Midtrans notification received without order_id, ignoring. Payload: {}", payload);
            return;
        }

        String orderId = rawOrderId.toString();

        Optional<Transaction> transactionOpt = transactionRepository.findByOrderId(orderId);

        if (transactionOpt.isEmpty()) {
            log.warn("Midtrans notification for unknown order_id={}, ignoring", orderId);
            return;
        }

        Transaction transaction = transactionOpt.get();

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            log.info("Order {} already resolved as {}, ignoring duplicate notification", orderId, transaction.getStatus());
            return;
        }

        JSONObject verified = midtransService.checkTransactionStatus(orderId);

        String transactionStatus = verified.optString("transaction_status", "");
        String fraudStatus = verified.optString("fraud_status", "accept");
        String paymentType = verified.optString("payment_type", null);

        log.info("Order {} verified status={} fraudStatus={}", orderId, transactionStatus, fraudStatus);

        if ("settlement".equals(transactionStatus)
                || ("capture".equals(transactionStatus) && "accept".equals(fraudStatus))) {

            creditWallet(transaction, paymentType);

        } else if ("deny".equals(transactionStatus)
                || "cancel".equals(transactionStatus)
                || "expire".equals(transactionStatus)) {

            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setPaymentType(paymentType);
            transactionRepository.save(transaction);

        }
    }

    private void creditWallet(Transaction transaction, String paymentType) {

        Wallet wallet = transaction.getDestinationWallet();

        wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        walletRepository.save(wallet);

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setPaymentType(paymentType);
        transactionRepository.save(transaction);

        log.info("Order {} settled - credited {} to wallet {}",
                transaction.getOrderId(), transaction.getAmount(), wallet.getId());
    }
}
