package com.tarifvergleich.electricity.dto;

import java.util.List;

public record EgonAddressFetchingDto(
		List<EgonAddressForCity> result
		) {

	public static record EgonAddressForCity(
			String zip,
			String city
			) {
		
	}
	
	public static record EgonAddressfetchStreet(List<EgonAddressForStreet> result) {
		
	}
	
	public static record EgonAddressForStreet(String street){
		
	}
}
