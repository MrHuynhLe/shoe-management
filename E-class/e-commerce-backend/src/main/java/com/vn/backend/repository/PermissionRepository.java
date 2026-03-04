package com.vn.backend.repository;

import com.vn.backend.entity.Permission;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    @Query(value = """
        SELECT DISTINCT p.code
        FROM users u
        JOIN role_permissions rp ON rp.role_id = u.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = :userId
    """, nativeQuery = true)
    List<String> findPermissionCodesByUserId(@Param("userId") Long userId);
}