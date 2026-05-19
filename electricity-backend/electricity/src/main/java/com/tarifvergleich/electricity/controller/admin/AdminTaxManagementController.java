package com.tarifvergleich.electricity.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.AdminTaxManagementDto;
import com.tarifvergleich.electricity.model.AdminTaxManagement;
import com.tarifvergleich.electricity.service.admin.AdminTaxManagementService;

@RestController
@RequestMapping("/tax-management")
@CrossOrigin("*")
public class AdminTaxManagementController {

    @Autowired
    private AdminTaxManagementService service;

    @PostMapping("/save")
    public AdminTaxManagement saveTax(@RequestBody AdminTaxManagementDto tax) {
        return service.saveTax(tax);
    }

    @GetMapping("/all")
    public List<AdminTaxManagement> getAllTaxs() {
        return service.getAllTaxs();
    }
    
    @PostMapping("/latest")
    public AdminTaxManagement getLatestTax() {
        return service.getLatestTax();
    }
}