package com.vn.backend.repository;

import com.vn.backend.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    @Query("SELECT i FROM InventoryTransaction i WHERE i.productVariant.id = :variantId ORDER BY i.createdAt DESC")
    Page<InventoryTransaction> findByProductVariantId(Long variantId, Pageable pageable);

    @Query("SELECT i FROM InventoryTransaction i WHERE i.store.id = :storeId ORDER BY i.createdAt DESC")
    Page<InventoryTransaction> findByStoreId(Long storeId, Pageable pageable);

    @Query("SELECT i FROM InventoryTransaction i ORDER BY i.createdAt DESC")
    Page<InventoryTransaction> findAllWithPagination(Pageable pageable);
}