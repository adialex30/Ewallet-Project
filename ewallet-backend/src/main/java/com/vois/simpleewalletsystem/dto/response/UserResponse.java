package com.vois.simpleewalletsystem.dto.response;

import com.vois.simpleewalletsystem.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private boolean active;
    private Long walletId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public boolean getActive() {
        return active;
    }
}