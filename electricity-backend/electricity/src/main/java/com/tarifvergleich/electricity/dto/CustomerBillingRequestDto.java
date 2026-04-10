package com.tarifvergleich.electricity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerBillingRequestDto {

	private String zip;
	private String city;
	private String street;
	private String houseNumber;
	private Boolean different;
}
