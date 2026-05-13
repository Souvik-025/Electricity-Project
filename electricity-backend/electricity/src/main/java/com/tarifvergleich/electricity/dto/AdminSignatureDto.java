package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AdminSignatureDto {

	private Integer adminSignatureId;
    private String originalFileName;
    private String filePath;
    private BigInteger addedOn;
    private BigInteger lastUpdatedOn;
    private Integer adminId;
}
