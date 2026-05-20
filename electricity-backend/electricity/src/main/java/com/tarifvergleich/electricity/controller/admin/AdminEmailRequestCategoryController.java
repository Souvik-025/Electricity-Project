package com.tarifvergleich.electricity.controller.admin;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto;
import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto.AdminEmailRequestCategoryAdminResponseDto;
import com.tarifvergleich.electricity.model.AdminEmailRequestCategory;
import com.tarifvergleich.electricity.service.admin.AdminEmailRequestCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/email-category")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminEmailRequestCategoryController {

	private final AdminEmailRequestCategoryService service;

	@PostMapping("/save")
	public AdminEmailRequestCategory saveCategory(@RequestBody AdminEmailRequestCategoryDto categoryDto) {
		return service.saveCategory(categoryDto);
	}

	@PostMapping("/all")
	public List<AdminEmailRequestCategoryAdminResponseDto> getAllCategories(
			@RequestBody AdminEmailRequestCategoryDto categoryDto) {
		return service.getAllCategories(categoryDto.getAdminId());
	}
}