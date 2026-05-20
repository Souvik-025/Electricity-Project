package com.tarifvergleich.electricity.service.customer;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerAddress;
import com.tarifvergleich.electricity.repository.CustomerAddressRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerUpdateService {

	private final CustomerRepository customerRepo;
	private final CustomerAddressRepository customerAddressRepo;

	@Transactional
	public Map<String, Object> updateCustomerDetail(CustomerDto customerDto) {

		if (customerDto.getAdminId() == null || customerDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		if (customerDto.getId() == null || customerDto.getId() <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		if (customerDto.getFirstName() == null || customerDto.getLastName() == null
				|| customerDto.getFirstName().isEmpty() || customerDto.getLastName().isEmpty())
			throw new InternalServerException("Customer name missing", HttpStatus.OK);

		if (customerDto.getSalutation() == null || customerDto.getSalutation().isEmpty())
			throw new InternalServerException("Salutation missing", HttpStatus.OK);

		Customer customer = customerRepo.findByCustomerIdAndAdminAdminId(customerDto.getId(), customerDto.getAdminId())
				.orElseThrow(
						() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (customer.getUserType().equalsIgnoreCase("BUSINESS") && customerDto.getCompanyName().isEmpty())
			throw new InternalServerException("Company name missing", HttpStatus.OK);

		if (customer.getUserType().equalsIgnoreCase("BUSINESS") && !customerDto.getCompanyName().isEmpty())
			customer.setCompanyName(customerDto.getCompanyName());

		customer.setFirstName(customerDto.getFirstName());
		customer.setLastName(customerDto.getLastName());
		customer.setSalutation(customerDto.getSalutation());

		customer.setTitle(customerDto.getTitle());
		
		if (customerDto.getMobileNumber() != null && !customerDto.getMobileNumber().isEmpty())
			customer.setMobileNumber(customerDto.getMobileNumber());

		if (customerDto.getZip() != null && customerDto.getCity() != null && customerDto.getStreet() != null
				&& !customerDto.getZip().isEmpty() && !customerDto.getCity().isEmpty()
				&& !customerDto.getStreet().isEmpty() && customerDto.getHouseNumber() != null
				&& !customerDto.getHouseNumber().isEmpty()) {
			CustomerAddress address = customerAddressRepo.findAddress(customer.getCustomerId(), customerDto.getZip(),
					customerDto.getCity(), customerDto.getStreet(), customerDto.getHouseNumber()).orElse(null);

			if (address != null) {
				customerAddressRepo.updateRegistrationStatus(false, customerDto.getId());
				address.setIsRegisterAddress(true);
				customerAddressRepo.save(address);
			} else {
				CustomerAddress newAddress = CustomerAddress.builder().zip(customerDto.getZip())
						.city(customerDto.getCity()).street(customerDto.getStreet())
						.houseNumber(customerDto.getHouseNumber()).isRegisterAddress(true).customerId(customer)
						.isRegisterAddress(true).build();
				customerAddressRepo.updateRegistrationStatus(false, customerDto.getId());
				customerAddressRepo.save(newAddress);
			}
		}

		if (customerDto.getZip() != null && !customerDto.getZip().isEmpty())
			customer.setZip(customerDto.getZip());
		if (customerDto.getCity() != null && !customerDto.getCity().isEmpty())
			customer.setCity(customer.getCity());
		if (customerDto.getStreet() != null && !customerDto.getStreet().isEmpty())
			customer.setStreet(customerDto.getStreet());
		if (customerDto.getHouseNumber() != null && !customerDto.getHouseNumber().isEmpty())
			customer.setHouseNumber(customerDto.getHouseNumber());

		customerRepo.save(customer);

		return Map.of("res", true, "message", "customer details updated successfully");
	}
}
