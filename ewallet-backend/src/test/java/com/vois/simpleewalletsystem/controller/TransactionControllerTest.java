//package com.vois.simpleewalletsystem.controller;
//
//import com.vois.simpleewalletsystem.dto.response.TransactionResponse;
//import com.vois.simpleewalletsystem.enums.TransactionStatus;
//import com.vois.simpleewalletsystem.enums.TransactionType;
//import com.vois.simpleewalletsystem.security.jwt.JwtAuthenticationFilter;
//import com.vois.simpleewalletsystem.service.TransactionService;
//import java.math.BigDecimal;
//import java.util.List;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@WebMvcTest(controllers = TransactionController.class)
//class TransactionControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private TransactionService transactionService;
//
//    @MockBean
//    private JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    @Test
//    @WithMockUser(username = "user@example.com", roles = {"USER"})
//    void shouldGetMyTransactionHistorySuccessfully() throws Exception {
//
//        TransactionResponse response = new TransactionResponse();
//        response.setId(1L);
//        response.setAmount(BigDecimal.valueOf(100));
//        response.setType(TransactionType.DEPOSIT);
//        response.setStatus(TransactionStatus.SUCCESS);
//        response.setDestinationWalletId(1L);
//
//        // Gunakan anyString() agar tidak terpengaruh perbedaan pencocokan string username
//        when(transactionService.getMyTransactionHistory(anyString()))
//                .thenReturn(List.of(response));
//
//        mockMvc.perform(get("/api/transactions"))
//                .andDo(print()) // Menampilkan isi JSON aktual di console terminal
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].id").value(1))
//                .andExpect(jsonPath("$[0].amount").value(100));
//    }
//}