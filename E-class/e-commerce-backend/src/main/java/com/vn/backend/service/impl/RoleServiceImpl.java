package com.vn.backend.service.impl;

import com.vn.backend.entity.Role;
import com.vn.backend.repository.RoleRepository;
import com.vn.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
    }

    @Override
    public Role createRole(Role role) {

        if (roleRepository.existsByCode(role.getCode())) {
            throw new RuntimeException("Role code đã tồn tại");
        }

        return roleRepository.save(role);
    }

    @Override
    public Role updateRole(Long id, Role role) {

        Role existing = getRoleById(id);

        existing.setName(role.getName());
        existing.setCode(role.getCode());

        return roleRepository.save(existing);
    }

    @Override
    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}