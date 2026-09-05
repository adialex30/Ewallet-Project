package com.vois.simpleewalletsystem.service.impl;

import com.vois.simpleewalletsystem.dto.request.UserRequest;
import com.vois.simpleewalletsystem.dto.request.UserUpdateRequest;
import com.vois.simpleewalletsystem.dto.response.UserResponse;
import com.vois.simpleewalletsystem.enums.Role;
import com.vois.simpleewalletsystem.entity.User;
import com.vois.simpleewalletsystem.exception.DuplicateEmailException;
import com.vois.simpleewalletsystem.exception.DuplicatePhoneNumberException;
import com.vois.simpleewalletsystem.exception.UserNotFoundException;
import com.vois.simpleewalletsystem.mapper.UserMapper;
import com.vois.simpleewalletsystem.repository.UserRepository;
import com.vois.simpleewalletsystem.service.UserService;
import com.vois.simpleewalletsystem.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {

        log.info("Creating user with email {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        String phoneNumber = normalizePhoneNumber(request.getPhoneNumber());

        if (phoneNumber != null && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicatePhoneNumberException("Phone number already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(phoneNumber)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.vois.simpleewalletsystem.enums.Role.valueOf(request.getRole().name()))
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        walletService.createWallet(savedUser);

        log.info("User created successfully with id {}", savedUser.getId());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        if (!user.getActive()) {
            throw new UserNotFoundException("User is deactivated");
        }

        checkOwnership(user, getCurrentUser());

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        checkOwnership(user, getCurrentUser());

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateEmailException("Email already exists");
        }

        String phoneNumber = normalizePhoneNumber(request.getPhoneNumber());

        if (phoneNumber != null
                && !phoneNumber.equals(user.getPhoneNumber())
                && userRepository.existsByPhoneNumber(phoneNumber)) {

            throw new DuplicatePhoneNumberException("Phone number already in use");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(phoneNumber);

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        User updatedUser = userRepository.save(user);

        log.info("User updated successfully with id {}", updatedUser.getId());

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public void deactivateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        user.setActive(false);

        userRepository.save(user);

        log.info("User deactivated successfully with id {}", id);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findByActiveTrue()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public void activateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        user.setActive(true);

        userRepository.save(user);

        log.info("User activated successfully with id {}", id);
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return (phoneNumber == null || phoneNumber.isBlank()) ? null : phoneNumber;
    }

    private User getCurrentUser() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));
    }

    private void checkOwnership(User target, User caller) {

        if (caller.getRole() == Role.ADMIN) {
            return;
        }

        if (!target.getId().equals(caller.getId())) {

            throw new AccessDeniedException(
                    "You do not have access to this user's data"
            );
        }
    }
}