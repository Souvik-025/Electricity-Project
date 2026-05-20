package com.tarifvergleich.electricity.service.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.AdminEmailRequestDto;
import com.tarifvergleich.electricity.dto.AdminEmailRequestDto.AdminEmailResponseDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminEmailManagement;
import com.tarifvergleich.electricity.model.AdminEmailRequestCategory;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.model.ManageAdminDocument;
import com.tarifvergleich.electricity.repository.AdminEmailManagementRepository;
import com.tarifvergleich.electricity.repository.AdminEmailRequestCategoryRepository;
import com.tarifvergleich.electricity.repository.AdminUserRepository;
import com.tarifvergleich.electricity.repository.ManageAdminDocumentRepository;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminEmailManagementService {

	private final AdminEmailManagementRepository repository;
	private final ManageAdminDocumentRepository manageAdminDocumentRepository;
	private final AdminEmailRequestCategoryRepository categoryRepository;
	private final AdminUserRepository adminUserRepo;

	@Transactional
	public AdminEmailManagement saveEmail(AdminEmailRequestDto request) {

		if (request.getAdminId() == null || request.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		if (request.getTitle() == null || request.getTitle().trim().isEmpty())
			throw new InternalServerException("Title cannot be empty", HttpStatus.OK);

//        if (request.getSubtitle() == null || request.getSubtitle().trim().isEmpty()) {
//
//            throw new InternalServerException("Subtitle cannot be empty", HttpStatus.OK);
//        }

		if (request.getEmailContent() == null || request.getEmailContent().trim().isEmpty())
			throw new InternalServerException("Email content cannot be empty", HttpStatus.OK);

		if (request.getCateId() == null)
			throw new InternalServerException("Category must be selected", HttpStatus.OK);

		AdminUser admin = adminUserRepo.findById(request.getAdminId())
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		AdminEmailRequestCategory adminEmailRequestCategory = categoryRepository
				.findByCateIdAndAdminAdminId(request.getCateId(), request.getAdminId()).orElseThrow(
						() -> new InternalServerException("Admin requested category not found with this credential",
								HttpStatus.OK));

		AdminEmailManagement email = new AdminEmailManagement();

		email.setTitle(request.getTitle());
		email.setSubtitle(request.getSubtitle());
		email.setEmailContent(request.getEmailContent());
		email.setCreatedDate(Helper.getCurrentTimeBerlin());
		email.setAdmin(admin);

		email.setCategory(adminEmailRequestCategory);

		AdminEmailManagement savedEmail = repository.save(email);

		List<ManageAdminDocument> documents = manageAdminDocumentRepository
				.findAllById(request.getPdfIds().stream().map(Long::intValue).toList());

		savedEmail.setDocuments(documents);

		savedEmail = repository.save(savedEmail);
		System.out.println("FULL REQUEST = " + request);
		System.out.println("PDF IDS = " + request.getPdfIds());
		System.err.println(documents);

		return savedEmail;
	}

	public List<AdminEmailResponseDto> getAllEmails(Integer adminId) {

		if (adminId == null || adminId <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		List<AdminEmailManagement> emailManagements = repository.findAllByAdminAdminId(adminId);

		List<AdminEmailResponseDto> emailManagementResponse = emailManagements.stream()
				.map(AdminEmailRequestDto::mapResponseForAdmin).toList();

		return emailManagementResponse;
	}

	public AdminEmailManagement getById(Long id) {

		return repository.findById(id).orElse(null);
	}
}
