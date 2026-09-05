package com.vois.simpleewalletsystem.service;
import com.vois.simpleewalletsystem.dto.request.UserRequest;
import com.vois.simpleewalletsystem.dto.request.UserUpdateRequest;
import com.vois.simpleewalletsystem.dto.response.UserResponse;
import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deactivateUser(Long id);
    void activateUser(Long id);
}

