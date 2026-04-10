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
public class CustomerConnectionRequestDto {

	private Integer id;

	private Boolean isMovingIn;

	@JsonFormat(pattern = "dd.MM.yyyy")
	private LocalDate moveInDate;

	private Boolean infoOnDelivery;

	private Boolean submitLater;

	private String meterNumber;

	private String marketLocationId;

	private String currentProvider;

	private Boolean autoCancellation;

	private Boolean alreadyCancelled;

	private Boolean selfCancellation;

	private Boolean delivery;

	@JsonFormat(pattern = "dd.MM.yyyy")
	private LocalDate desiredDelivery;

}
