package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.tarifvergleich.electricity.model.CustomerConnect;

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

	private Boolean submitLater;

	private String meterNumber;

	private String marketLocationId;

	private String currentProvider;

	private Boolean autoCancellation;

	private Boolean alreadyCancelled;

	private Boolean selfCancellation;

	private Boolean delivery;
	
	private String customerNumber;

	@JsonFormat(pattern = "dd.MM.yyyy")
	private LocalDate desiredDelivery;

	@JsonSetter("moveInDate")
	public void setMoveInDate(String moveInDateStr) {
		if (moveInDateStr == null || moveInDateStr.isBlank()) {
			this.moveInDate = null;
		} else {
			this.moveInDate = LocalDate.parse(moveInDateStr, DateTimeFormatter.ofPattern("dd.MM.yyyy"));
		}
	}

	@JsonSetter("desiredDelivery")
	public void setDesiredDelivery(String desiredDeliveryStr) {
		if (desiredDeliveryStr == null || desiredDeliveryStr.isBlank()) {
			this.desiredDelivery = null;
		} else {
			this.desiredDelivery = LocalDate.parse(desiredDeliveryStr, DateTimeFormatter.ofPattern("dd.MM.yyyy"));
		}
	}

	@Data
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class CustomerConnectionResponse {
		private Integer id;
		private Boolean isMovingIn;
		private BigInteger moveInDate;
		private Boolean submitLater;
		private String meterNumber;
		private String marketLocationId;
		private String currentProvider;
		private Boolean autoCancellation;
		private Boolean alreadyCancelled;
		private Boolean selfCancellation;
		private Boolean delivery;
		private BigInteger desiredDelivery;
		private String customerNumber;
	}

	public static CustomerConnectionResponse getConnectionResponse(CustomerConnect connect) {

		if (connect == null)
			return null;

		return CustomerConnectionResponse.builder().id(connect.getId()).isMovingIn(connect.getIsMovingIn())
				.moveInDate(connect.getMoveInDate()).submitLater(connect.getSubmitLater())
				.meterNumber(connect.getMeterNumber()).marketLocationId(connect.getMarketLocationId())
				.currentProvider(connect.getCurrentProvider()).autoCancellation(connect.getAutoCancellation())
				.alreadyCancelled(connect.getAlreadyCancelled()).selfCancellation(connect.getSelfCancellation())
				.customerNumber(connect.getCustomerNumber())
				.delivery(connect.getDelivery()).desiredDelivery(connect.getDesiredDelivery()).build();
	}

}
