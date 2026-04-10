package com.tarifvergleich.electricity.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.tarifvergleich.electricity.dto.CustomerAddressDto;
import com.tarifvergleich.electricity.dto.CustomerResponseDto;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerAddress;

@Component
public class CustomerResponseMapper {

	public CustomerResponseDto toResponseDto(Customer customer) {
        if (customer == null) {
            return null;
        }

        return CustomerResponseDto.builder()
                .customerId(customer.getCustomerId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .userType(customer.getUserType())
                .title(customer.getTitle())
                .salutation(customer.getSalutation())
                .companyName(customer.getCompanyName())
                .mobileNumber(customer.getMobileNumber())
                .joinedOn(customer.getJoinedOn())
                .isVerified(customer.getIsVerified())
                .status(customer.getStatus())
                .addresses(mapAddressList(customer.getCustomerAddresses()))
                .build();
    }
	
	private List<CustomerAddressDto> mapAddressList(List<CustomerAddress> addresses) {
        if (addresses == null) {
            return Collections.emptyList();
        }

        return addresses.stream()
                .map(addr -> CustomerAddressDto.builder()
                        .id(addr.getId())
                        .zip(addr.getZip())
                        .city(addr.getCity())
                        .street(addr.getStreet())
                        .houseNumber(addr.getHouseNumber())
                        .build())
                .collect(Collectors.toList());
    }
}
