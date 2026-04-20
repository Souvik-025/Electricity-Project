package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;
import com.tarifvergleich.electricity.dto.CustomerDto.CustomerShortDetail;
import com.tarifvergleich.electricity.model.CustomerComparingEnergy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerComparingEnergyDto {

	private Integer id;
	private String zip;
	private String city;
	private String street;
	private String houseNumber;
	private String consumption;
	private String consumerType;
	private String branch;
	private CustomerShortDetail customer;
	private BigInteger comparedOn;
	private String requestIp;
	private String requestDeviceDetails;
	@JsonRawValue
	private JsonNode baseProviderResponse; 
	@JsonRawValue
	private JsonNode energyRateResponse;
	private Integer adminId;
	
	public static CustomerComparingEnergyDto customerComparisonResponse(CustomerComparingEnergy energyComp) {
		return CustomerComparingEnergyDto.builder()
				.id(energyComp.getId())
				.zip(energyComp.getZip())
	            .city(energyComp.getCity())
	            .street(energyComp.getStreet())
	            .houseNumber(energyComp.getHouseNumber())
	            .consumption(energyComp.getConsumption())
	            .consumerType(energyComp.getConsumerType())
	            .branch(energyComp.getBranch())
	            .customer(CustomerDto.customerShortResponse(energyComp.getCustomer()))
	            .comparedOn(energyComp.getComparedOn())
	            .requestIp(energyComp.getRequestIp())
	            .requestDeviceDetails(energyComp.getRequestDeviceDetails())
	            .baseProviderResponse(energyComp.getBaseProviderResponse())
	            .energyRateResponse(energyComp.getEnergyRateResponse())
	            .adminId(energyComp.getAdmin().getAdminId())
				.build();
	}
}
