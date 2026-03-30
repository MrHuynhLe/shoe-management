package com.vn.backend.repository;

import com.vn.backend.entity.Employee;
import com.vn.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserProfile(UserProfile userProfile);

    Optional<Employee> findTopByOrderByIdDesc();
}
