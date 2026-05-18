package com.tarifvergleich.electricity.controller.admin;

import com.tarifvergleich.electricity.model.AdminTaxManagement;
import com.tarifvergleich.electricity.service.admin.AdminTaxManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tax-management")
@CrossOrigin("*")
public class AdminTaxManagementController {

    @Autowired
    private AdminTaxManagementService service;

    @PostMapping("/save")
    public AdminTaxManagement saveTax(@RequestBody AdminTaxManagement tax) {
        return service.saveTax(tax);
    }

    @GetMapping("/all")
    public List<AdminTaxManagement> getAllTaxs() {
        return service.getAllTaxs();
    }
    
    @GetMapping("/latest")
    public AdminTaxManagement getLatestTax() {

        return service.getLatestTax();
    }
}