package com.vn.backend.repository;

import com.vn.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByPhone(String phone);

    Optional<UserProfile> findByPhone(String phone);
}
