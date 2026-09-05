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

    /** Admin-only system-wide activity log. */
    List<Transaction> findAllByOrderByCreatedAtDesc();

    /**
     * Used by the Midtrans webhook handler to find which pending topup
     * a notification belongs to.
     */
    Optional<Transaction> findByOrderId(String orderId);
}