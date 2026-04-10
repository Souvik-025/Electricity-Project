package com.tarifvergleich.electricity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class CustomerAddressDto {

	private Integer id;
    private String zip;
    private String city;
    private String street;
    private String houseNumber;
    private Integer customerId;
}
