package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class CustomerResponseDto {

	private Integer customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String userType;
    private String title;
    private String salutation;
    private String companyName;
    private String mobileNumber;
    private BigInteger joinedOn;
    private Boolean isVerified;
    private Boolean status;
    
    private List<CustomerAddressDto> addresses;
        
}
