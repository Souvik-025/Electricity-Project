package com.tarifvergleich.electricity.controller.admin;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.AdminEmailRequestDto;
import com.tarifvergleich.electricity.dto.AdminEmailRequestDto.AdminEmailResponseDto;
import com.tarifvergleich.electricity.model.AdminEmailManagement;
import com.tarifvergleich.electricity.service.admin.AdminEmailManagementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/email-management")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminEmailManagementController {

	private final AdminEmailManagementService service;

	@PostMapping("/save")
	public AdminEmailManagement saveEmail(@RequestBody AdminEmailRequestDto request) {
		return service.saveEmail(request);
	}

	@PostMapping("/all")
	public List<AdminEmailResponseDto> getAllEmails(@RequestBody AdminEmailRequestDto request) {
		return service.getAllEmails(request.getAdminId());
	}

	@GetMapping("/{id}")
	public AdminEmailManagement getById(@PathVariable Long id) {
		return service.getById(id);
	}
}