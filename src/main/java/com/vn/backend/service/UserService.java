package com.vn.backend.service;

import com.vn.backend.dto.request.UpdateUserRequest;
import com.vn.backend.dto.request.UpdateUserStatusRequest;
import com.vn.backend.dto.request.UserCreateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.UserDetailResponse;
import com.vn.backend.dto.response.UserResponse;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface UserService {


    List<UserResponse> getAllUsers();

    // có phân trang
    PageResponse<UserResponse> getUsersPage(
            int page,
            int size,
            String keyword
    );

    void createUser(UserCreateRequest request);



    void updateStatus(Long id, UpdateUserStatusRequest request);

    void restoreUser(Long id);

    void  deleteUser(Long id);

    void updateUser(Long id, UpdateUserRequest request);

    UserDetailResponse getUserById(Long id);

}