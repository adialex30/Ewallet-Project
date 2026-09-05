package com.vois.simpleewalletsystem.service.impl;

import com.vois.simpleewalletsystem.dto.request.TransferRequest;
import com.vois.simpleewalletsystem.dto.request.WithdrawalRequest;
import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
import com.vois.simpleewalletsystem.entity.Transaction;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.entity.Wallet;
import com.vois.simpleewalletsystem.enums.Role;
import com.vois.simpleewalletsystem.exception.InsufficientBalanceException;
import com.vois.simpleewalletsystem.exception.InvalidTransactionException;
import com.vois.simpleewalletsystem.exception.UserNotFoundException;
import com.vois.simpleewalletsystem.exception.WalletNotFoundException;
import com.vois.simpleewalletsystem.repository.TransactionRepository;
import com.vois.simpleewalletsystem.repository.UserRepository;
import com.vois.simpleewalletsystem.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Rewritten against the new current-user-scoped TransactionService shape
 * (withdraw/transfer resolve the wallet from the authenticated user's email,
 * not from a walletId path parameter; transfer resolves its recipient by
 * email/phone via TransferRequest.recipient instead of destinationWalletId).
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User userWithWallet(Long userId, String email, BigDecimal balance, Long walletId) {

        User user = User.builder().id(userId).email(email).role(Role.USER).build();

        Wallet wallet = Wallet.builder().id(walletId).balance(balance).user(user).build();
        user.setWallet(wallet);

        return user;
    }

    // ===== withdraw =====

    @Test
    void shouldWithdrawSuccessfully() {

        User user = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(200), 10L);

        WithdrawalRequest request = new WithdrawalRequest();
        request.setAmount("50");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(user));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(100L);
            return t;
        });

        TransactionResponse response = transactionService.withdraw(request, "sender@example.com");

        assertEquals(BigDecimal.valueOf(50), response.getAmount());
        assertEquals(BigDecimal.valueOf(150), user.getWallet().getBalance());

        verify(walletRepository).save(user.getWallet());
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void shouldThrowWhenWithdrawingMoreThanBalance() {

        User user = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(30), 10L);

        WithdrawalRequest request = new WithdrawalRequest();
        request.setAmount("50");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(user));

        assertThrows(InsufficientBalanceException.class,
                () -> transactionService.withdraw(request, "sender@example.com"));

        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void shouldThrowWhenWithdrawingWithNoWallet() {

        User user = User.builder().id(1L).email("nowallet@example.com").role(Role.USER).build();

        WithdrawalRequest request = new WithdrawalRequest();
        request.setAmount("50");

        when(userRepository.findByEmail("nowallet@example.com")).thenReturn(Optional.of(user));

        assertThrows(WalletNotFoundException.class,
                () -> transactionService.withdraw(request, "nowallet@example.com"));
    }

    // ===== transfer =====

    @Test
    void shouldTransferSuccessfullyByEmail() {

        User sender = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(200), 10L);
        User recipient = userWithWallet(2L, "recipient@example.com", BigDecimal.valueOf(100), 20L);

        TransferRequest request = new TransferRequest();
        request.setAmount("50");
        request.setRecipient("recipient@example.com");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmailOrPhoneNumber("recipient@example.com", "recipient@example.com"))
                .thenReturn(Optional.of(recipient));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(101L);
            return t;
        });

        TransactionResponse response = transactionService.transfer(request, "sender@example.com");

        assertEquals(BigDecimal.valueOf(50), response.getAmount());
        assertEquals(BigDecimal.valueOf(150), sender.getWallet().getBalance());
        assertEquals(BigDecimal.valueOf(150), recipient.getWallet().getBalance());

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        verify(walletRepository, times(2)).save(walletCaptor.capture());
    }

    @Test
    void shouldTransferSuccessfullyByPhone() {

        User sender = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(200), 10L);
        User recipient = userWithWallet(2L, "recipient@example.com", BigDecimal.valueOf(100), 20L);
        recipient.setPhoneNumber("081234567890");

        TransferRequest request = new TransferRequest();
        request.setAmount("50");
        request.setRecipient("081234567890");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmailOrPhoneNumber("081234567890", "081234567890"))
                .thenReturn(Optional.of(recipient));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(102L);
            return t;
        });

        TransactionResponse response = transactionService.transfer(request, "sender@example.com");

        assertEquals(BigDecimal.valueOf(50), response.getAmount());
    }

    @Test
    void shouldThrowWhenTransferringMoreThanBalance() {

        User sender = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(30), 10L);
        User recipient = userWithWallet(2L, "recipient@example.com", BigDecimal.valueOf(100), 20L);

        TransferRequest request = new TransferRequest();
        request.setAmount("50");
        request.setRecipient("recipient@example.com");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmailOrPhoneNumber("recipient@example.com", "recipient@example.com"))
                .thenReturn(Optional.of(recipient));

        assertThrows(InsufficientBalanceException.class,
                () -> transactionService.transfer(request, "sender@example.com"));

        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    void shouldThrowWhenRecipientNotFound() {

        User sender = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(200), 10L);

        TransferRequest request = new TransferRequest();
        request.setAmount("50");
        request.setRecipient("nobody@example.com");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmailOrPhoneNumber("nobody@example.com", "nobody@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> transactionService.transfer(request, "sender@example.com"));
    }

    @Test
    void shouldThrowWhenTransferringToOwnWallet() {

        User sender = userWithWallet(1L, "sender@example.com", BigDecimal.valueOf(200), 10L);

        TransferRequest request = new TransferRequest();
        request.setAmount("50");
        request.setRecipient("sender@example.com");

        when(userRepository.findByEmail("sender@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmailOrPhoneNumber("sender@example.com", "sender@example.com"))
                .thenReturn(Optional.of(sender));

        assertThrows(InvalidTransactionException.class,
                () -> transactionService.transfer(request, "sender@example.com"));
    }

    // ===== getMyTransactionHistory =====

    @Test
    void shouldGetMyTransactionHistory() {

        User user = userWithWallet(1L, "user@example.com", BigDecimal.valueOf(100), 10L);

        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setAmount(BigDecimal.valueOf(50));
        transaction.setSourceWallet(user.getWallet());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(transactionRepository.findBySourceWalletIdOrDestinationWalletIdOrderByCreatedAtDesc(10L, 10L))
                .thenReturn(List.of(transaction));

        List<TransactionResponse> history = transactionService.getMyTransactionHistory("user@example.com");

        assertEquals(1, history.size());
        assertEquals(BigDecimal.valueOf(50), history.get(0).getAmount());
    }
}
