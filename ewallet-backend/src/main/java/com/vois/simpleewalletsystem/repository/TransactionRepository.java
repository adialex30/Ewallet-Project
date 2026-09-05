package com.vois.simpleewalletsystem.repository;

import com.vois.simpleewalletsystem.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySourceWalletIdOrDestinationWalletIdOrderByCreatedAtDesc(
            Long sourceWalletId,
            Long destinationWalletId
    );

    List<Transaction> findAllByOrderByCreatedAtDesc();
    Optional<Transaction> findByOrderId(String orderId);
}