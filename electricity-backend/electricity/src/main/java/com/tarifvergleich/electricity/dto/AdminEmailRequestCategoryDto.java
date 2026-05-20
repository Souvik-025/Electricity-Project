package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.AdminEmailRequestCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AdminEmailRequestCategoryDto {

	private Long cateId;
	private String name;
	private BigInteger createdDate;
	private String categorySlug;
	private Integer adminId;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class AdminEmailRequestCategoryAdminResponseDto {
		private Long cateId;
		private String name;
		private String categorySlug;
	}

	public static AdminEmailRequestCategoryAdminResponseDto mapCategory(AdminEmailRequestCategory category) {
		if (category == null)
			return null;

		return AdminEmailRequestCategoryAdminResponseDto.builder().cateId(category.getCateId()).name(category.getName())
				.categorySlug(category.getCategorySlug()).build();
	}
}
