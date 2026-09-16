package com.freelancer.backend.service;

import com.freelancer.backend.model.Contract;
import com.freelancer.backend.repository.ContractRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractService {

    private final ContractRepository contractRepository;

    public ContractService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public Contract createContract(Contract contract) {
        if (contract.getStatus() == null || contract.getStatus().isEmpty()) {
            contract.setStatus("ACTIVE");
        }

        return contractRepository.save(contract);
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    public List<Contract> getContractsByClient(String clientEmail) {
        return contractRepository.findByClientEmail(clientEmail);
    }

    public List<Contract> getContractsByFreelancer(String freelancerEmail) {
        return contractRepository.findByFreelancerEmail(freelancerEmail);
    }
}