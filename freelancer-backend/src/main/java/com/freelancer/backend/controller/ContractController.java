package com.freelancer.backend.controller;

import com.freelancer.backend.model.Contract;
import com.freelancer.backend.service.ContractService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    public Contract createContract(@RequestBody Contract contract) {
        return contractService.createContract(contract);
    }

    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.getAllContracts();
    }

    @GetMapping("/client/{email}")
    public List<Contract> getContractsByClient(@PathVariable String email) {
        return contractService.getContractsByClient(email);
    }

    @GetMapping("/freelancer/{email}")
    public List<Contract> getContractsByFreelancer(@PathVariable String email) {
        return contractService.getContractsByFreelancer(email);
    }
}