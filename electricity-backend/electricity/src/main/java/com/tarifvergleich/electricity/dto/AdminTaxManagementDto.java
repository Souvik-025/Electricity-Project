package com.tarifvergleich.electricity.dto;

import java.math.BigDecimal;
import java.math.BigInteger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AdminTaxManagementDto {
	
	private Long taxId;
	private BigDecimal value;
	private BigInteger createdDate;
	private Integer adminId;

}
