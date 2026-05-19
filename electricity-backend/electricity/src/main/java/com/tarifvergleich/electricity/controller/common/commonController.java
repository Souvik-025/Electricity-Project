package com.tarifvergleich.electricity.controller.common;

import com.tarifvergleich.electricity.dto.request.CustomerQueryContactRequestDTO;
import com.tarifvergleich.electricity.dto.response.CustomerQueryContactResponseDTO;
import com.tarifvergleich.electricity.service.common.CommonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping
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

    @PostMapping("/link-customer-query")
    public ResponseEntity<?> linkCustomerQuery(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(commonService.saveQuery((CustomerQueryContactRequestDTO) payload));
    }
}