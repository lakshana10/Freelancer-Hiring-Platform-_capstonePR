package com.freelancer.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.backend.dto.MilestoneDto.MilestoneRequest;
import com.freelancer.backend.dto.MilestoneDto.MilestoneResponse;
import com.freelancer.backend.dto.MilestoneDto.MilestoneSubmitRequest;
import com.freelancer.backend.model.User;
import com.freelancer.backend.security.JwtService;
import com.freelancer.backend.service.MilestoneService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MilestoneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private MilestoneService milestoneService;

    private String bearer(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setRole(role);
        return "Bearer " + jwtService.generateToken(user);
    }

    private MilestoneRequest createRequest() {
        MilestoneRequest request = new MilestoneRequest();
        request.setContractId(9L);
        request.setTitle("Homepage");
        request.setAmount(200.0);
        return request;
    }

    private MilestoneResponse milestoneResponse() {
        MilestoneResponse response = new MilestoneResponse();
        response.setId(3L);
        response.setContractId(9L);
        response.setTitle("Homepage");
        response.setAmount(200.0);
        response.setStatus("PENDING");
        return response;
    }

    @Test
    void createAsClientReturns201() throws Exception {
        when(milestoneService.createMilestone(
                any(MilestoneRequest.class),
                anyString(), anyBoolean()))
                .thenReturn(milestoneResponse());

        mockMvc.perform(post("/api/milestones")
                        .header("Authorization",
                                bearer("client@test.com", "CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                createRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Homepage"));
    }

    @Test
    void createAsFreelancerIsForbidden() throws Exception {
        mockMvc.perform(post("/api/milestones")
                        .header("Authorization",
                                bearer("dev@test.com", "FREELANCER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                createRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    void createWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/milestones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                createRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void historyWithoutAuthReturns401() throws Exception {
        mockMvc.perform(get("/api/milestones/contract/9"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void historyWithAuthReturnsList() throws Exception {
        when(milestoneService.getByContract(anyLong()))
                .thenReturn(List.of(milestoneResponse()));

        mockMvc.perform(get("/api/milestones/contract/9")
                        .header("Authorization",
                                bearer("client@test.com", "CLIENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void submitAsFreelancerSucceeds() throws Exception {
        MilestoneResponse submitted = milestoneResponse();
        submitted.setStatus("SUBMITTED");
        when(milestoneService.submitWork(
                anyLong(),
                any(MilestoneSubmitRequest.class),
                anyString(), anyBoolean()))
                .thenReturn(submitted);

        MilestoneSubmitRequest request = new MilestoneSubmitRequest();
        request.setSubmission("Done.");

        mockMvc.perform(put("/api/milestones/3/submit")
                        .header("Authorization",
                                bearer("dev@test.com", "FREELANCER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void reviewAsClientSucceeds() throws Exception {
        MilestoneResponse approved = milestoneResponse();
        approved.setStatus("APPROVED");
        when(milestoneService.review(
                anyLong(), anyString(),
                anyString(), anyBoolean()))
                .thenReturn(approved);

        mockMvc.perform(put("/api/milestones/3/review")
                        .param("status", "APPROVED")
                        .header("Authorization",
                                bearer("client@test.com", "CLIENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
