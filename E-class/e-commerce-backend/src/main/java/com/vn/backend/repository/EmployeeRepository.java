package com.vn.backend.repository;

import com.vn.backend.entity.Employee;
import com.vn.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Employee findTopByOrderByIdDesc();

    Optional<Employee> findByUserProfile(UserProfile profile);

}
