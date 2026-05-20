package com.tarifvergleich.electricity.dto;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto.AdminEmailRequestCategoryAdminResponseDto;
import com.tarifvergleich.electricity.dto.ManageAdminDocumentDto.ManageAdminDocumentResDto;
import com.tarifvergleich.electricity.model.AdminEmailManagement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AdminEmailRequestDto {

	private String title;
	private String subtitle;
	private String emailContent;
	private String createdBy;

	private Long cateId;
	private Integer adminId;
	private List<Long> pdfIds;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class AdminEmailResponseDto {
		private String title;
		private String subtitle;
		private String emailContent;

		private AdminEmailRequestCategoryAdminResponseDto category;
		private List<ManageAdminDocumentResDto> documents;
	}

	public static AdminEmailResponseDto mapResponseForAdmin(AdminEmailManagement management) {
		if (management == null)
			return null;

		return AdminEmailResponseDto.builder().title(management.getTitle()).subtitle(management.getSubtitle())
				.emailContent(management.getEmailContent())
				.category(AdminEmailRequestCategoryDto.mapCategory(management.getCategory()))
				.documents(Optional.ofNullable(management.getDocuments()).orElseGet(Collections::emptyList).stream()
						.map(ManageAdminDocumentDto::mapForAdmin).toList())
				.build();
	}
}