package com.tarifvergleich.electricity.service.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto;
import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto.AdminEmailRequestCategoryAdminResponseDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminEmailRequestCategory;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.repository.AdminEmailRequestCategoryRepository;
import com.tarifvergleich.electricity.repository.AdminUserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminEmailRequestCategoryService {

	private final AdminEmailRequestCategoryRepository repository;
	private final AdminUserRepository adminUserRepo;

	@Transactional
	public AdminEmailRequestCategory saveCategory(AdminEmailRequestCategoryDto categoryDto) {

		if (categoryDto.getName() == null || categoryDto.getName().trim().isEmpty()) {
			throw new InternalServerException("Category name cannot be empty", HttpStatus.OK);
		}

		if (categoryDto.getAdminId() == null || categoryDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		AdminUser admin = adminUserRepo.findById(categoryDto.getAdminId())
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		String categorySlug = categoryDto.getName().trim().replace(" ", "_").toUpperCase();

		AdminEmailRequestCategory category = AdminEmailRequestCategory.builder().name(categoryDto.getName())
				.admin(admin).categorySlug(categorySlug).build();

		return repository.save(category);
	}

	public List<AdminEmailRequestCategoryAdminResponseDto> getAllCategories(Integer adminId) {

		if (adminId == null || adminId <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		List<AdminEmailRequestCategory> categories = repository.findAllByAdminAdminIdOrderByNameAsc(adminId);

		List<AdminEmailRequestCategoryAdminResponseDto> responsecategory = categories.stream()
				.map(AdminEmailRequestCategoryDto::mapCategory).toList();

		return responsecategory;
	}
}