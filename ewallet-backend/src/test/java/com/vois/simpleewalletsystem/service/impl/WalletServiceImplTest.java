//package com.vois.simpleewalletsystem.service.impl;
//
//import com.vois.simpleewalletsystem.dto.request.DepositRequest;
//import com.vois.simpleewalletsystem.dto.response.WalletBalanceResponse;
//import com.vois.simpleewalletsystem.dto.response.WalletResponse;
//import com.vois.simpleewalletsystem.entity.User;
//import com.vois.simpleewalletsystem.entity.Wallet;
//import com.vois.simpleewalletsystem.exception.WalletNotFoundException;
//import com.vois.simpleewalletsystem.mapper.WalletMapper;
//import com.vois.simpleewalletsystem.repository.UserRepository;
//import com.vois.simpleewalletsystem.repository.WalletRepository;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class WalletServiceImplTest {
//
//    @Mock
//    private WalletRepository walletRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private WalletMapper walletMapper;
//
//    @InjectMocks
//    private WalletServiceImpl walletService;
//
//    @Test
//    void shouldGetWalletByIdSuccessfully() {
//
//        User user = User.builder()
//                .id(2L)
//                .email("test@example.com")
//                .build();
//
//        Wallet wallet = Wallet.builder()
//                .id(1L)
//                .balance(BigDecimal.valueOf(100))
//                .user(user)
//                .build();
//
//        WalletResponse expectedResponse = new WalletResponse()
//                .id(1L)
//                .balance(BigDecimal.valueOf(100))
//                .userId(2L);
//
//        when(userRepository.findByEmail("test@example.com"))
//                .thenReturn(Optional.of(user));
//
//        when(walletRepository.findById(1L))
//                .thenReturn(Optional.of(wallet));
//
//        when(walletMapper.toResponse(wallet))
//                .thenReturn(expectedResponse);
//
//        WalletResponse actualResponse =
//                walletService.getWalletById(
//                        1L,
//                        "test@example.com"
//                );
//
//        assertEquals(
//                expectedResponse.getId(),
//                actualResponse.getId()
//        );
//
//        assertEquals(
//                expectedResponse.getBalance(),
//                actualResponse.getBalance()
//        );
//
//        verify(userRepository)
//                .findByEmail("test@example.com");
//
//        verify(walletRepository)
//                .findById(1L);
//
//        verify(walletMapper)
//                .toResponse(wallet);
//    }
//
//    @Test
//    void shouldThrowExceptionWhenWalletNotFound() {
//
//        when(walletRepository.findById(99L))
//                .thenReturn(Optional.empty());
//
//        assertThrows(
//                WalletNotFoundException.class,
//                () -> walletService.getWalletById(
//                        99L,
//                        "test@example.com"
//                )
//        );
//
//        verify(walletRepository)
//                .findById(99L);
//
//        verifyNoInteractions(userRepository);
//        verifyNoInteractions(walletMapper);
//    }
//
//    @Test
//    void shouldGetWalletBalanceSuccessfully() {
//
//        User user = User.builder()
//                .id(2L)
//                .email("test@example.com")
//                .build();
//
//        Wallet wallet = Wallet.builder()
//                .id(1L)
//                .balance(BigDecimal.valueOf(250))
//                .user(user)
//                .build();
//
//        WalletBalanceResponse expectedResponse =
//                new WalletBalanceResponse()
//                        .walletId(1L)
//                        .balance(BigDecimal.valueOf(250));
//
//        when(userRepository.findByEmail("test@example.com"))
//                .thenReturn(Optional.of(user));
//
//        when(walletRepository.findById(1L))
//                .thenReturn(Optional.of(wallet));
//
//        when(walletMapper.toBalanceResponse(wallet))
//                .thenReturn(expectedResponse);
//
//        WalletBalanceResponse actualResponse =
//                walletService.getWalletBalance(
//                        1L,
//                        "test@example.com"
//                );
//
//        assertEquals(
//                expectedResponse.getBalance(),
//                actualResponse.getBalance()
//        );
//
//        verify(userRepository)
//                .findByEmail("test@example.com");
//
//        verify(walletRepository)
//                .findById(1L);
//
//        verify(walletMapper)
//                .toBalanceResponse(wallet);
//    }
//
//    @Test
//    void shouldDepositSuccessfully() {
//
//        User user = User.builder()
//                .id(2L)
//                .email("test@example.com")
//                .build();
//
//        Wallet wallet = Wallet.builder()
//                .id(1L)
//                .balance(BigDecimal.valueOf(100))
//                .user(user)
//                .build();
//
//        DepositRequest request = new DepositRequest()
//                .amount(BigDecimal.valueOf(50));
//
//        WalletResponse expectedResponse =
//                new WalletResponse()
//                        .id(1L)
//                        .balance(BigDecimal.valueOf(150))
//                        .userId(2L);
//
//        when(userRepository.findByEmail("test@example.com"))
//                .thenReturn(Optional.of(user));
//
//        when(walletRepository.findById(1L))
//                .thenReturn(Optional.of(wallet));
//
//        when(walletRepository.save(any(Wallet.class)))
//                .thenReturn(wallet);
//
//        when(walletMapper.toResponse(wallet))
//                .thenReturn(expectedResponse);
//
//        WalletResponse actualResponse =
//                walletService.deposit(
//                        1L,
//                        request,
//                        "test@example.com"
//                );
//
//        assertEquals(
//                BigDecimal.valueOf(150),
//                actualResponse.getBalance()
//        );
//
//        verify(userRepository)
//                .findByEmail("test@example.com");
//
//        verify(walletRepository)
//                .findById(1L);
//
//        verify(walletRepository)
//                .save(wallet);
//
//        verify(walletMapper)
//                .toResponse(wallet);
//    }
//
//    @Test
//    void shouldThrowExceptionWhenDepositingToNonExistingWallet() {
//
//        DepositRequest request = new DepositRequest()
//                .amount(BigDecimal.valueOf(50));
//
//        when(walletRepository.findById(99L))
//                .thenReturn(Optional.empty());
//
//        assertThrows(
//                WalletNotFoundException.class,
//                () -> walletService.deposit(
//                        99L,
//                        request,
//                        "test@example.com"
//                )
//        );
//
//        verify(walletRepository)
//                .findById(99L);
//
//        verify(walletRepository, never())
//                .save(any(Wallet.class));
//
//        verifyNoInteractions(walletMapper);
//    }
//}