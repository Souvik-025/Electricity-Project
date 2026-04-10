package com.tarifvergleich.electricity.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDeliveryDto {

	private Integer id;
	private String title;
	private String firstName;
	private String lastName;
	private String mobile;
	private String telephone;
	@JsonFormat(pattern = "dd.MM.yyyy")
	private LocalDate deliveryDate;
	private String zip;
	private String city;
	private String street;
	private String houseNumber;
}
