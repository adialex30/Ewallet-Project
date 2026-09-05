//package com.vois.simpleewalletsystem.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.vois.simpleewalletsystem.dto.request.UserRequest;
//import com.vois.simpleewalletsystem.dto.response.UserResponse;
//import com.vois.simpleewalletsystem.enums.Role;
//import com.vois.simpleewalletsystem.security.jwt.JwtService;
//
//import com.vois.simpleewalletsystem.security.jwt.JwtAuthenticationFilter;
//import com.vois.simpleewalletsystem.service.UserService;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
//import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import java.util.List;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.doNothing;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
//import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//@WebMvcTest(UserController.class)
//@AutoConfigureMockMvc(addFilters = false)
//class UserControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockitoBean
//    private UserService userService;
//
//
//    @MockitoBean
//      private JwtService jwtService;
//    @MockitoBean
//      private JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    private final
//    ObjectMapper objectMapper = new ObjectMapper();
//
//    @Test
//    void shouldCreateUserSuccessfully() throws Exception {
//
//        UserRequest request = new UserRequest()
//                .fullName("Sandy")
//                .email("sandy@gmail.com")
//                .password("12345678")
//                .role(Role.USER);
//
//        UserResponse response = new UserResponse()
//                .id(1L)
//                .fullName("Sandy")
//                .email("sandy@gmail.com")
//                .role(Role.USER)
//                .active(true);
//
//        when(userService.createUser(any(UserRequest.class)))
//                .thenReturn(response);
//
//        mockMvc.perform(post("/users")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.id").value(1))
//                .andExpect(jsonPath("$.email").value("sandy@gmail.com"));
//    }
//    @Test
//    void shouldGetUserByIdSuccessfully() throws Exception {
//
//        UserResponse response = new UserResponse()
//                .id(1L)
//                .fullName("Sandy")
//                .email("sandy@gmail.com")
//                .role(Role.USER)
//                .active(true);
//
//        when(userService.getUserById(1L))
//                .thenReturn(response);
//
//        mockMvc.perform(get("/users/1"))
//                .andDo(print())
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1))
//                .andExpect(jsonPath("$.email").value("sandy@gmail.com"));
//    }
//    @Test
//    void shouldReturnAllUsers() throws Exception {
//
//        UserResponse response = new UserResponse()
//                .id(1L)
//                .fullName("Sandy")
//                .email("sandy@gmail.com");
//
//        when(userService.getAllUsers())
//                .thenReturn(List.of(response));
//
//        mockMvc.perform(get("/users"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].id").value(1))
//                .andExpect(jsonPath("$[0].email").value("sandy@gmail.com"));
//    }
//    @Test
//    void shouldUpdateUserSuccessfully() throws Exception {
//        UserRequest request = new UserRequest()
//                .fullName("Updated")
//                .email("updated@gmail.com")
//                .password("12345678")
//                .role(Role.USER);
//
//        UserResponse response = new UserResponse()
//                .id(1L)
//                .fullName("Updated")
//                .email("updated@gmail.com");
//
//        when(userService.updateUser(any(Long.class), any(UserRequest.class)))
//                .thenReturn(response);
//
//        mockMvc.perform(put("/users/1")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.fullName").value("Updated"));
//    }
//    @Test
//    void shouldDeactivateUserSuccessfully() throws Exception {
//
//        doNothing().when(userService).deactivateUser(1L);
//
//        mockMvc.perform(patch("/users/1/deactivate"))
//                .andExpect(status().isOk())
//                .andExpect(content().string("User deactivated successfully"));
//    }
//}
