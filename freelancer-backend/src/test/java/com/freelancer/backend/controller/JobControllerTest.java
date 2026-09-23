package com.freelancer.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.backend.dto.JobDto.JobRequest;
import com.freelancer.backend.dto.JobDto.JobResponse;
import com.freelancer.backend.model.User;
import com.freelancer.backend.security.JwtService;
import com.freelancer.backend.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private JobService jobService;

    private JobRequest jobRequest() {
        JobRequest request = new JobRequest();
        request.setTitle("Build a website");
        request.setDescription("Need a portfolio site.");
        request.setBudget(500.0);
        request.setSkills("HTML, CSS");
        request.setClientEmail("client@test.com");
        return request;
    }

    private JobResponse jobResponse() {
        JobResponse response = new JobResponse();
        response.setId(1L);
        response.setTitle("Build a website");
        response.setDescription("Need a portfolio site.");
        response.setBudget(500.0);
        response.setSkills("HTML, CSS");
        response.setClientEmail("client@test.com");
        return response;
    }

    private String bearer(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setRole(role);
        return "Bearer " + jwtService.generateToken(user);
    }

    @Test
    void getAllJobsIsPublic() throws Exception {
        when(jobService.getAllJobs())
                .thenReturn(List.of(jobResponse()));

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title")
                        .value("Build a website"));
    }

    @Test
    void getJobByIdIsPublic() throws Exception {
        when(jobService.getJobById(1L))
                .thenReturn(jobResponse());

        mockMvc.perform(get("/api/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createJobWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                jobRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createJobAsClientSucceeds() throws Exception {
        when(jobService.createJob(
                any(JobRequest.class), anyString()))
                .thenReturn(jobResponse());

        mockMvc.perform(post("/api/jobs")
                        .header("Authorization",
                                bearer("client@test.com", "CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                jobRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clientEmail")
                        .value("client@test.com"));
    }

    @Test
    void createJobAsFreelancerIsForbidden() throws Exception {
        mockMvc.perform(post("/api/jobs")
                        .header("Authorization",
                                bearer("dev@test.com", "FREELANCER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                jobRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteJobAsFreelancerIsForbidden() throws Exception {
        mockMvc.perform(delete("/api/jobs/1")
                        .header("Authorization",
                                bearer("dev@test.com", "FREELANCER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteJobAsOwnerSucceeds() throws Exception {
        mockMvc.perform(delete("/api/jobs/1")
                        .header("Authorization",
                                bearer("client@test.com", "CLIENT")))
                .andExpect(status().isOk());
    }

    @Test
    void deleteJobWithoutAuthReturns401() throws Exception {
        mockMvc.perform(delete("/api/jobs/1"))
                .andExpect(status().isUnauthorized());
    }
}
