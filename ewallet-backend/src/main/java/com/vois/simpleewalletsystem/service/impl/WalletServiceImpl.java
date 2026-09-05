package com.vois.simpleewalletsystem.service.impl;

import com.vois.simpleewalletsystem.dto.response.WalletBalanceResponse;
import com.vois.simpleewalletsystem.dto.response.WalletResponse;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.entity.Wallet;
import com.vois.simpleewalletsystem.enums.Role;
import com.vois.simpleewalletsystem.exception.UserNotFoundException;
import com.vois.simpleewalletsystem.exception.WalletNotFoundException;
import com.vois.simpleewalletsystem.mapper.WalletMapper;
import com.vois.simpleewalletsystem.repository.UserRepository;
import com.vois.simpleewalletsystem.repository.WalletRepository;
import com.vois.simpleewalletsystem.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletMapper walletMapper;
    private final UserRepository userRepository;

    @Override
    public WalletResponse createWallet(User user) {

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);

        return walletMapper.toResponse(savedWallet);
    }

    @Override
    public WalletResponse getWalletById(Long walletId, String userEmail) {

        Wallet wallet = findWalletOrThrow(walletId);
        User user = findUserByEmail(userEmail);

        checkWalletOwnership(wallet, user);

        return walletMapper.toResponse(wallet);
    }

    @Override
    public WalletBalanceResponse getWalletBalance(Long walletId, String userEmail) {

        Wallet wallet = findWalletOrThrow(walletId);
        User user = findUserByEmail(userEmail);

        checkWalletOwnership(wallet, user);

        return walletMapper.toBalanceResponse(wallet);
    }

    @Override
    public WalletResponse getMyWallet(String userEmail) {

        Wallet wallet = findMyWallet(userEmail);

        return walletMapper.toResponse(wallet);
    }

    @Override
    public WalletBalanceResponse getMyWalletBalance(String userEmail) {

        Wallet wallet = findMyWallet(userEmail);

        return walletMapper.toBalanceResponse(wallet);
    }

    private Wallet findMyWallet(String userEmail) {

        User user = findUserByEmail(userEmail);

        Wallet wallet = user.getWallet();

        if (wallet == null) {
            throw new WalletNotFoundException("Wallet not found for current user");
        }

        return wallet;
    }

    private Wallet findWalletOrThrow(Long walletId) {

        return walletRepository.findById(walletId)
                .orElseThrow(() ->
                        new WalletNotFoundException("Wallet not found with id: " + walletId));
    }

    private User findUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));
    }

    private void checkWalletOwnership(Wallet wallet, User user) {

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (!wallet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this wallet");
        }
    }
}
