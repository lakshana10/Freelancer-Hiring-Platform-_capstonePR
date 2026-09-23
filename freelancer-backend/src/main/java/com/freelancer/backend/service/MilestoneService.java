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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Milestone lifecycle per contract:
 * PENDING -> SUBMITTED -> APPROVED | REVISION_REQUESTED.
 * Clients split work and review it; freelancers submit against it.
 * Every transition notifies the other side.
 */
@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;

    private final ContractRepository contractRepository;

    private final NotificationService notificationService;

    public MilestoneService(
            MilestoneRepository milestoneRepository,
            ContractRepository contractRepository,
            NotificationService notificationService) {
        this.milestoneRepository = milestoneRepository;
        this.contractRepository = contractRepository;
        this.notificationService = notificationService;
    }

    // Client (or admin) splits a contract into payable work.
    public MilestoneResponse createMilestone(
            MilestoneRequest request,
            String requesterEmail, boolean admin) {

        Contract contract = loadContract(request.getContractId());

        requireClient(contract, requesterEmail, admin,
                "Only the contract client can add milestones.");

        Milestone milestone = new Milestone();
        milestone.setContractId(contract.getId());
        milestone.setJobId(contract.getJobId());
        milestone.setJobTitle(contract.getJobTitle());
        milestone.setTitle(request.getTitle().trim());
        milestone.setDescription(request.getDescription() == null
                ? null : request.getDescription().trim());
        milestone.setAmount(request.getAmount());
        milestone.setStatus(Milestone.PENDING);
        milestone.setCreatedAt(LocalDateTime.now());

        MilestoneResponse saved = MilestoneResponse.from(
                milestoneRepository.save(milestone));

        notificationService.notify(
                contract.getFreelancerEmail(),
                "New milestone '" + saved.getTitle() + "' added to '"
                + saved.getJobTitle() + "' ($" + saved.getAmount()
                + ").");

        return saved;
    }

    public List<MilestoneResponse> getByContract(Long contractId) {
        // Existence check keeps room URLs honest.
        loadContract(contractId);

        return milestoneRepository
                .findByContractIdOrderByIdAsc(contractId)
                .stream()
                .map(MilestoneResponse::from)
                .toList();
    }

    // Hired freelancer (or admin) submits completed work.
    public MilestoneResponse submitWork(
            Long id, MilestoneSubmitRequest request,
            String requesterEmail, boolean admin) {

        Milestone milestone = loadMilestone(id);
        Contract contract = loadContract(milestone.getContractId());

        if (!admin
                && (requesterEmail == null
                    || contract.getFreelancerEmail() == null
                    || !contract.getFreelancerEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(
                    "Only the hired freelancer can submit work "
                    + "for this milestone.");
        }

        if (!Milestone.PENDING.equalsIgnoreCase(milestone.getStatus())
                && !Milestone.REVISION_REQUESTED.equalsIgnoreCase(
                        milestone.getStatus())) {
            throw new BadRequestException(
                    "Only pending milestones or revision requests "
                    + "can be submitted.");
        }

        milestone.setSubmission(request.getSubmission().trim());
        milestone.setStatus(Milestone.SUBMITTED);

        MilestoneResponse saved = MilestoneResponse.from(
                milestoneRepository.save(milestone));

        notificationService.notify(
                contract.getClientEmail(),
                "'" + contract.getFreelancerEmail() + "' submitted '"
                + saved.getTitle() + "' for your review.");

        return saved;
    }

    // Client (or admin) approves or asks for another revision.
    public MilestoneResponse review(
            Long id, String status,
            String requesterEmail, boolean admin) {

        if (!Milestone.APPROVED.equalsIgnoreCase(status)
                && !Milestone.REVISION_REQUESTED.equalsIgnoreCase(
                        status)) {
            throw new BadRequestException(
                    "Status must be APPROVED or REVISION_REQUESTED.");
        }

        Milestone milestone = loadMilestone(id);
        Contract contract = loadContract(milestone.getContractId());

        requireClient(contract, requesterEmail, admin,
                "Only the contract client can review milestones.");

        if (!Milestone.SUBMITTED.equalsIgnoreCase(
                milestone.getStatus())) {
            throw new BadRequestException(
                    "Only submitted milestones can be reviewed.");
        }

        milestone.setStatus(status.toUpperCase());

        MilestoneResponse saved = MilestoneResponse.from(
                milestoneRepository.save(milestone));

        notificationService.notify(
                contract.getFreelancerEmail(),
                "Milestone '" + saved.getTitle() + "' was "
                + status.toUpperCase() + ".");

        return saved;
    }

    private Milestone loadMilestone(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Milestone not found."));
    }

    private Contract loadContract(Long contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contract not found."));
    }

    private void requireClient(
            Contract contract, String requesterEmail,
            boolean admin, String message) {

        if (!admin
                && (requesterEmail == null
                    || contract.getClientEmail() == null
                    || !contract.getClientEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(message);
        }
    }
}
