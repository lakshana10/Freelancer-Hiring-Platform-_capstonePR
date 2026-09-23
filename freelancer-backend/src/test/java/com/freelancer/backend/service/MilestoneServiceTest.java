package com.freelancer.backend.service;

import com.freelancer.backend.dto.MilestoneDto.MilestoneRequest;
import com.freelancer.backend.dto.MilestoneDto.MilestoneResponse;
import com.freelancer.backend.dto.MilestoneDto.MilestoneSubmitRequest;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Contract;
import com.freelancer.backend.model.Milestone;
import com.freelancer.backend.repository.ContractRepository;
import com.freelancer.backend.repository.MilestoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MilestoneServiceTest {

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private NotificationService notificationService;

    private MilestoneService milestoneService;

    @BeforeEach
    void setUp() {
        milestoneService = new MilestoneService(
                milestoneRepository, contractRepository,
                notificationService);
    }

    private Contract contract() {
        Contract contract = new Contract();
        contract.setId(9L);
        contract.setJobId(7L);
        contract.setJobTitle("Build a website");
        contract.setClientEmail("client@test.com");
        contract.setFreelancerEmail("dev@test.com");
        contract.setStatus("ACTIVE");
        return contract;
    }

    private MilestoneRequest createRequest() {
        MilestoneRequest request = new MilestoneRequest();
        request.setContractId(9L);
        request.setTitle("Homepage");
        request.setDescription("Build the landing page.");
        request.setAmount(200.0);
        return request;
    }

    private Milestone pendingMilestone() {
        Milestone milestone = new Milestone();
        milestone.setId(3L);
        milestone.setContractId(9L);
        milestone.setJobId(7L);
        milestone.setJobTitle("Build a website");
        milestone.setTitle("Homepage");
        milestone.setAmount(200.0);
        milestone.setStatus(Milestone.PENDING);
        return milestone;
    }

    @Test
    void createMilestoneNotifiesFreelancer() {
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));
        when(milestoneRepository.save(any(Milestone.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        MilestoneResponse response = milestoneService.createMilestone(
                createRequest(), "client@test.com", false);

        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getContractId()).isEqualTo(9L);
        verify(notificationService).notify(
                eq("dev@test.com"), anyString());
    }

    @Test
    void createMilestoneByStrangerIsForbidden() {
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));

        assertThatThrownBy(() -> milestoneService.createMilestone(
                createRequest(), "stranger@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void submitWorkNotifiesClient() {
        Milestone milestone = pendingMilestone();
        when(milestoneRepository.findById(3L))
                .thenReturn(Optional.of(milestone));
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));
        when(milestoneRepository.save(any(Milestone.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        MilestoneSubmitRequest submit = new MilestoneSubmitRequest();
        submit.setSubmission("Done: see staging link.");

        MilestoneResponse response = milestoneService.submitWork(
                3L, submit, "dev@test.com", false);

        assertThat(response.getStatus()).isEqualTo("SUBMITTED");
        verify(notificationService).notify(
                eq("client@test.com"), anyString());
    }

    @Test
    void submitApprovedMilestoneIsRejected() {
        Milestone milestone = pendingMilestone();
        milestone.setStatus(Milestone.APPROVED);
        when(milestoneRepository.findById(3L))
                .thenReturn(Optional.of(milestone));
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));

        MilestoneSubmitRequest submit = new MilestoneSubmitRequest();
        submit.setSubmission("Again.");

        assertThatThrownBy(() -> milestoneService.submitWork(
                3L, submit, "dev@test.com", false))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void reviewApproveNotifiesFreelancer() {
        Milestone milestone = pendingMilestone();
        milestone.setStatus(Milestone.SUBMITTED);
        when(milestoneRepository.findById(3L))
                .thenReturn(Optional.of(milestone));
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));
        when(milestoneRepository.save(any(Milestone.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        MilestoneResponse response = milestoneService.review(
                3L, "APPROVED", "client@test.com", false);

        assertThat(response.getStatus()).isEqualTo("APPROVED");
        verify(notificationService).notify(
                eq("dev@test.com"), anyString());
    }

    @Test
    void reviewWithBadStatusIsRejected() {
        assertThatThrownBy(() -> milestoneService.review(
                3L, "DONE", "client@test.com", false))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void reviewUnsubmittedMilestoneIsRejected() {
        Milestone milestone = pendingMilestone();
        when(milestoneRepository.findById(3L))
                .thenReturn(Optional.of(milestone));
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));

        assertThatThrownBy(() -> milestoneService.review(
                3L, "APPROVED", "client@test.com", false))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void missingMilestoneThrowsNotFound() {
        when(milestoneRepository.findById(99L))
                .thenReturn(Optional.empty());

        MilestoneSubmitRequest submit = new MilestoneSubmitRequest();
        submit.setSubmission("Work.");

        assertThatThrownBy(() -> milestoneService.submitWork(
                99L, submit, "dev@test.com", false))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void historyListsContractMilestones() {
        when(contractRepository.findById(9L))
                .thenReturn(Optional.of(contract()));
        when(milestoneRepository.findByContractIdOrderByIdAsc(9L))
                .thenReturn(List.of(pendingMilestone()));

        assertThat(milestoneService.getByContract(9L)).hasSize(1);
    }
}
