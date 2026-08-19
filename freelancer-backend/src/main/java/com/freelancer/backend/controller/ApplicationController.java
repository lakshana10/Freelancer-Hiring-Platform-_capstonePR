package com.freelancer.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
@CrossOrigin
public class ApplicationController {

    @PostMapping("/apply")
    public String applyJob(@RequestParam String jobTitle) {
        return "Application started for: " + jobTitle;
    }
}