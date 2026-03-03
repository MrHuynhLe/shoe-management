package com.vn.backend.controller;


import com.vn.backend.dto.request.UpdateUserRequest;
import com.vn.backend.dto.request.UpdateUserStatusRequest;
import com.vn.backend.dto.request.UserCreateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.UserDetailResponse;
import com.vn.backend.dto.response.UserResponse;
import com.vn.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ LIST

    // phân trang
    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                userService.getUsersPage(page, size, keyword)
        );
    }
    // ✅ CREATE
    @PostMapping
    public ResponseEntity<Void> createUser(
            @RequestBody @Valid UserCreateRequest request
    ) {
        userService.createUser(request);
        System.out.println("Thêm thaành công ");
        return ResponseEntity.ok().build();
    }

    // ✅ UPDATE STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateUserStatusRequest request
    ) {
        userService.updateStatus(id, request);
        return ResponseEntity.ok().build();
    }

    // ✅ DELETE (SOFT)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
    // reset ID delete
    @PatchMapping("/{id}/restore")
    public ResponseEntity<?> restoreUser(@PathVariable Long id) {

        userService.restoreUser(id);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Khôi phục user thành công"
                )
        );
    }
    //detail
    @GetMapping("/{id}")
    public ResponseEntity<UserDetailResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // update
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        userService.updateUser(id, request);
        return ResponseEntity.ok("Update thành công");
    }
}
