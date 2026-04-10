package com.tarifvergleich.electricity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerConnectWrapper {

	private Integer customerId;
	private Integer deliveryId;
	private CustomerConnectionRequestDto customerConnectionDto;
}
