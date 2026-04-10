package com.tarifvergleich.electricity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.CustomerConnectWrapper;
import com.tarifvergleich.electricity.dto.CustomerDeliveryRequestWrapper;
import com.tarifvergleich.electricity.dto.CustomerDto;
import com.tarifvergleich.electricity.service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/customer")
public class CustomerController {

	
	private final CustomerService customerService;
	
	@PostMapping("/fetch-customer")
	public ResponseEntity<?> fetchCustomer(@RequestBody CustomerDto customerDto){
		return ResponseEntity.ok(customerService.fetchCustomer(customerDto.getId()));
	}
	
	@PostMapping("/add-delivery")
	public ResponseEntity<?> addDelivery(@RequestBody CustomerDeliveryRequestWrapper deliveryWrapper){
		return ResponseEntity.ok(customerService.saveDelivery(deliveryWrapper.getCustomerId(), deliveryWrapper.getDeliveryAddress(), deliveryWrapper.getBillingAddress()));
	}
	
	@PostMapping("/add-connection")
	public ResponseEntity<?> addConnection(@RequestBody CustomerConnectWrapper payload){
		return ResponseEntity.ok(customerService.saveConnection(payload.getCustomerId(), payload.getDeliveryId(), payload.getCustomerConnectionDto()));
	}
}
