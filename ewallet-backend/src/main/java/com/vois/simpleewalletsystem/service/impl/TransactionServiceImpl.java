package com.vois.simpleewalletsystem.service.impl;

import com.vois.simpleewalletsystem.dto.request.TransferRequest;
import com.vois.simpleewalletsystem.dto.request.WithdrawalRequest;
import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
import com.vois.simpleewalletsystem.entity.Transaction;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.entity.Wallet;
import com.vois.simpleewalletsystem.enums.Role;
import com.vois.simpleewalletsystem.enums.TransactionStatus;
import com.vois.simpleewalletsystem.enums.TransactionType;
import com.vois.simpleewalletsystem.exception.InsufficientBalanceException;
import com.vois.simpleewalletsystem.exception.InvalidTransactionException;
import com.vois.simpleewalletsystem.exception.TransactionNotFoundException;
import com.vois.simpleewalletsystem.exception.UserNotFoundException;
import com.vois.simpleewalletsystem.exception.WalletNotFoundException;
import com.vois.simpleewalletsystem.repository.TransactionRepository;
import com.vois.simpleewalletsystem.repository.UserRepository;
import com.vois.simpleewalletsystem.repository.WalletRepository;
import com.vois.simpleewalletsystem.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest request, String userEmail) {

        Wallet wallet = getMyWallet(userEmail);

        BigDecimal amount = new BigDecimal(request.getAmount());

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance for withdrawal. Current balance: " + wallet.getBalance());
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setType(TransactionType.WITHDRAW);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setSourceWallet(wallet);

        transaction = transactionRepository.save(transaction);

        return convertToDTO(transaction);
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request, String userEmail) {

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet sourceWallet = currentUser.getWallet();

        if (sourceWallet == null) {
            throw new WalletNotFoundException("Wallet not found for current user");
        }

        String recipient = request.getRecipient();

        User recipientUser = userRepository.findByEmailOrPhoneNumber(recipient, recipient)
                .orElseThrow(() -> new UserNotFoundException("Recipient not found: " + recipient));

        Wallet destinationWallet = recipientUser.getWallet();

        if (destinationWallet == null) {
            throw new WalletNotFoundException("Recipient does not have a wallet");
        }

        if (sourceWallet.getId().equals(destinationWallet.getId())) {
            throw new InvalidTransactionException("Cannot transfer to your own wallet");
        }

        BigDecimal amount = new BigDecimal(request.getAmount());

        if (sourceWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance for transfer. Current balance: " + sourceWallet.getBalance());
        }

        sourceWallet.setBalance(sourceWallet.getBalance().subtract(amount));
        destinationWallet.setBalance(destinationWallet.getBalance().add(amount));

        walletRepository.save(sourceWallet);
        walletRepository.save(destinationWallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setSourceWallet(sourceWallet);
        transaction.setDestinationWallet(destinationWallet);

        transaction = transactionRepository.save(transaction);

        return convertToDTO(transaction);
    }

    @Override
    public List<TransactionResponse> getMyTransactionHistory(String userEmail) {

        Wallet wallet = getMyWallet(userEmail);

        List<Transaction> transactions =
                transactionRepository.findBySourceWalletIdOrDestinationWalletIdOrderByCreatedAtDesc(
                        wallet.getId(), wallet.getId());

        return transactions.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<TransactionResponse> getTransactionHistory(Long walletId) {

        getAuthorizedWallet(walletId);

        List<Transaction> transactions =
                transactionRepository.findBySourceWalletIdOrDestinationWalletIdOrderByCreatedAtDesc(
                        walletId, walletId);

        return transactions.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<TransactionResponse> getAllTransactions() {

        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public TransactionResponse getTransactionById(Long transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new TransactionNotFoundException("Transaction not found with ID: " + transactionId));

        if (transaction.getSourceWallet() != null) {
            getAuthorizedWallet(transaction.getSourceWallet().getId());
        } else if (transaction.getDestinationWallet() != null) {
            getAuthorizedWallet(transaction.getDestinationWallet().getId());
        } else {
            throw new AccessDeniedException("You are not authorized to access this transaction");
        }

        User currentUser = getCurrentUser();

        boolean isSourceOwner = transaction.getSourceWallet() != null
                && transaction.getSourceWallet().getUser().getId().equals(currentUser.getId());

        boolean isDestinationOwner = transaction.getDestinationWallet() != null
                && transaction.getDestinationWallet().getUser().getId().equals(currentUser.getId());

        if (currentUser.getRole() != Role.ADMIN && !isSourceOwner && !isDestinationOwner) {
            throw new AccessDeniedException("You do not have access to this transaction");
        }

        return convertToDTO(transaction);
    }

    /**
     * Resolves the wallet belonging to whoever is currently authenticated -
     * no ID parameter involved, so there is nothing for User A to manipulate
     * to reach User B's wallet.
     */
    private Wallet getMyWallet(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = user.getWallet();

        if (wallet == null) {
            throw new WalletNotFoundException("Wallet not found for current user");
        }

        return wallet;
    }

    private User getCurrentUser() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found"));
    }

    private Wallet getAuthorizedWallet(Long walletId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found with ID: " + walletId));

        if (currentUser.getRole() == Role.ADMIN) {
            return wallet;
        }

        if (wallet.getUser() == null || !wallet.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to access this wallet");
        }

        return wallet;
    }

    private TransactionResponse convertToDTO(Transaction transaction) {

        TransactionResponse dto = new TransactionResponse();

        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setStatus(transaction.getStatus());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setOrderId(transaction.getOrderId());
        dto.setPaymentType(transaction.getPaymentType());

        if (transaction.getSourceWallet() != null) {
            dto.setSourceWalletId(transaction.getSourceWallet().getId());

            User sourceUser = transaction.getSourceWallet().getUser();
            if (sourceUser != null) {
                dto.setSourceUserFullName(sourceUser.getFullName());
                dto.setSourceUserEmail(sourceUser.getEmail());
            }
        }

        if (transaction.getDestinationWallet() != null) {
            dto.setDestinationWalletId(transaction.getDestinationWallet().getId());

            User destinationUser = transaction.getDestinationWallet().getUser();
            if (destinationUser != null) {
                dto.setDestinationUserFullName(destinationUser.getFullName());
                dto.setDestinationUserEmail(destinationUser.getEmail());
            }
        }

        return dto;
    }
}
