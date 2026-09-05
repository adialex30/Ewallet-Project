package com.vois.simpleewalletsystem.repository;

import com.vois.simpleewalletsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByActiveTrue();

    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);
}