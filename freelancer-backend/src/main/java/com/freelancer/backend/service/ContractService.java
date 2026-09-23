package com.freelancer.backend.service;

import com.freelancer.backend.dto.ContractDto.ContractRequest;
import com.freelancer.backend.dto.ContractDto.ContractResponse;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Contract;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.repository.ContractRepository;
import com.freelancer.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractService {

    private final ContractRepository contractRepository;

    private final JobRepository jobRepository;

    public ContractService(
            ContractRepository contractRepository,
            JobRepository jobRepository) {
        this.contractRepository = contractRepository;
        this.jobRepository = jobRepository;
    }

    public ContractResponse createContract(
            ContractRequest request,
            String requesterEmail, boolean admin) {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));

        if (!admin
                && (requesterEmail == null
                    || job.getClientEmail() == null
                    || !job.getClientEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(
                    "Only the client who posted this job can "
                    + "create a contract for it.");
        }

        Contract contract = new Contract();
        contract.setJobId(request.getJobId());
        contract.setJobTitle(request.getJobTitle() != null
                ? request.getJobTitle()
                : job.getTitle());
        contract.setClientEmail(
                admin && request.getClientEmail() != null
                        ? request.getClientEmail()
                        : requesterEmail);
        contract.setFreelancerEmail(request.getFreelancerEmail());
        contract.setStatus(request.getStatus() == null
                || request.getStatus().isEmpty()
                        ? "ACTIVE"
                        : request.getStatus());

        return ContractResponse.from(
                contractRepository.save(contract));
    }

    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll()
                .stream()
                .map(ContractResponse::from)
                .toList();
    }

    public List<ContractResponse> getContractsByClient(
            String clientEmail) {
        return contractRepository
                .findByClientEmail(clientEmail)
                .stream()
                .map(ContractResponse::from)
                .toList();
    }

    public List<ContractResponse> getContractsByFreelancer(
            String freelancerEmail) {
        return contractRepository
                .findByFreelancerEmail(freelancerEmail)
                .stream()
                .map(ContractResponse::from)
                .toList();
    }
}
