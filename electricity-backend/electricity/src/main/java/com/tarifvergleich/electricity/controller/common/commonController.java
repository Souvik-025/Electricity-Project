package com.tarifvergleich.electricity.controller.common;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.request.CustomerQueryContactRequestDTO;
import com.tarifvergleich.electricity.service.common.CommonService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping
@CrossOrigin(origins = "*")
public class commonController {

    private final CommonService commonService;

    @PostMapping("/fetch-contact-category")
    public ResponseEntity<?> fetchContactCategory() {
        return ResponseEntity.ok(commonService.getAllCategories());
    }

    @PostMapping("/save-customer-contact")
    public ResponseEntity<?> saveCustomerContact(@RequestBody CustomerQueryContactRequestDTO dto) {
        Map<String, Object> response = commonService.saveQuery(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/fetch-customer-queries")
    public ResponseEntity<?> fetchCustomerQueries() {
        return ResponseEntity.ok(commonService.getAllCustomers());
    }
}