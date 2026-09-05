//package com.vois.simpleewalletsystem.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.vois.simpleewalletsystem.dto.request.DepositRequest;
//import com.vois.simpleewalletsystem.dto.response.WalletBalanceResponse;
//import com.vois.simpleewalletsystem.dto.response.WalletResponse;
//import com.vois.simpleewalletsystem.security.jwt.JwtAuthenticationFilter;
//import com.vois.simpleewalletsystem.security.jwt.JwtService;
//import com.vois.simpleewalletsystem.service.WalletService;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
//import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
//import org.springframework.http.MediaType;
//import org.springframework.security.core.Authentication;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.math.BigDecimal;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.mock;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@WebMvcTest(WalletController.class)
//@AutoConfigureMockMvc(addFilters = false)
//class WalletControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockitoBean
//    private WalletService walletService;
//
//    @MockitoBean
//    private JwtService jwtService;
//
//    @MockitoBean
//    private JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//
//    @Test
//    void shouldGetWalletSuccessfully() throws Exception {
//
//        Authentication authentication = mock(Authentication.class);
//
//        when(authentication.getName())
//                .thenReturn("test@example.com");
//
//        WalletResponse response = new WalletResponse()
//                .id(1L)
//                .balance(BigDecimal.valueOf(100))
//                .userId(2L);
//
//        when(walletService.getWalletById(
//                1L,
//                "test@example.com"
//        )).thenReturn(response);
//
//        mockMvc.perform(
//                        get("/wallets/1")
//                                .principal(authentication)
//                )
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1))
//                .andExpect(jsonPath("$.balance").value(100));
//    }
//
//
//    @Test
//    void shouldGetWalletBalanceSuccessfully() throws Exception {
//
//        Authentication authentication = mock(Authentication.class);
//
//        when(authentication.getName())
//                .thenReturn("test@example.com");
//
//        WalletBalanceResponse response = new WalletBalanceResponse()
//                .walletId(1L)
//                .balance(BigDecimal.valueOf(250));
//
//        when(walletService.getWalletBalance(
//                1L,
//                "test@example.com"
//        )).thenReturn(response);
//
//        mockMvc.perform(
//                        get("/wallets/1/balance")
//                                .principal(authentication)
//                )
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.walletId").value(1))
//                .andExpect(jsonPath("$.balance").value(250));
//    }
//
//
//    @Test
//    void shouldDepositSuccessfully() throws Exception {
//
//        Authentication authentication = mock(Authentication.class);
//
//        when(authentication.getName())
//                .thenReturn("test@example.com");
//
//        DepositRequest request = new DepositRequest()
//                .amount(BigDecimal.valueOf(50));
//
//        WalletResponse response = new WalletResponse()
//                .id(1L)
//                .balance(BigDecimal.valueOf(150))
//                .userId(2L);
//
//        when(walletService.deposit(
//                eq(1L),
//                any(DepositRequest.class),
//                eq("test@example.com")
//        )).thenReturn(response);
//
//        mockMvc.perform(
//                        post("/wallets/1/deposit")
//                                .principal(authentication)
//                                .contentType(MediaType.APPLICATION_JSON)
//                                .content(
//                                        objectMapper.writeValueAsString(request)
//                                )
//                )
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.balance").value(150));
//    }
//
//
//    @Test
//    void shouldReturnBadRequestWhenDepositAmountIsNegative()
//            throws Exception {
//
//        Authentication authentication = mock(Authentication.class);
//
//        when(authentication.getName())
//                .thenReturn("test@example.com");
//
//        DepositRequest request = new DepositRequest()
//                .amount(BigDecimal.valueOf(-50));
//
//        mockMvc.perform(
//                        post("/wallets/1/deposit")
//                                .principal(authentication)
//                                .contentType(MediaType.APPLICATION_JSON)
//                                .content(
//                                        objectMapper.writeValueAsString(request)
//                                )
//                )
//                .andExpect(status().isBadRequest());
//    }
//}
