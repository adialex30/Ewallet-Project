package com.vois.simpleewalletsystem.dto.request;
import com.vois.simpleewalletsystem.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UserRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Pattern(regexp = "^$|^\\+?[0-9]{8,15}$", message = "Phone number must be 8-15 digits, optionally prefixed with +")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max =20, message = "password must be al least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

}
