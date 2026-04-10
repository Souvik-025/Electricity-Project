package com.tarifvergleich.electricity.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerBillingRequestDto;
import com.tarifvergleich.electricity.dto.CustomerConnectionRequestDto;
import com.tarifvergleich.electricity.dto.CustomerDeliveryDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.mapper.CustomerResponseMapper;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerAddress;
import com.tarifvergleich.electricity.model.CustomerBillingAddress;
import com.tarifvergleich.electricity.model.CustomerConnect;
import com.tarifvergleich.electricity.model.CustomerDelivery;
import com.tarifvergleich.electricity.repository.CustomerAddressRepository;
import com.tarifvergleich.electricity.repository.CustomerBillingAddressRepository;
import com.tarifvergleich.electricity.repository.CustomerDeliveryRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

	private final CustomerRepository customerRepo;
	private final CustomerAddressRepository customerAddressRepo;
	private final CustomerResponseMapper customerResponseMapper;
	private final CustomerDeliveryRepository customerDeliveryRepo;
	private final CustomerBillingAddressRepository customerBillingAddressRepo;
	private final Helper helper;

	@Transactional
	public Map<String, Object> saveDelivery(Integer customerId, CustomerDeliveryDto deliveryDto,
			CustomerBillingRequestDto billingRequestDto) {

		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.BAD_REQUEST);

		Customer customer = customerRepo.findById(customerId)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.BAD_REQUEST));

		if (deliveryDto == null)
			throw new InternalServerException("Delivery details not found", HttpStatus.BAD_REQUEST);
		if (billingRequestDto == null)
			throw new InternalServerException("Billing details not found", HttpStatus.BAD_REQUEST);

		if (deliveryDto.getFirstName() == null || deliveryDto.getFirstName().isEmpty()
				|| deliveryDto.getLastName() == null || deliveryDto.getLastName().isEmpty())
			throw new InternalServerException("Name missing", HttpStatus.BAD_REQUEST);

		if (deliveryDto.getMobile() == null || deliveryDto.getMobile().isEmpty())
			throw new InternalServerException("Mobile number missing", HttpStatus.BAD_REQUEST);

//		if(deliveryDto.getTelephone() == null || deliveryDto.getTelephone().isEmpty())
//			throw new InternalServerException("Telephone number missing", HttpStatus.BAD_REQUEST);

		if (deliveryDto.getZip() == null || deliveryDto.getZip().isEmpty())
			throw new InternalServerException("Zip code missing", HttpStatus.BAD_REQUEST);

		if (deliveryDto.getCity() == null || deliveryDto.getCity().isEmpty())
			throw new InternalServerException("City missing", HttpStatus.BAD_REQUEST);

		if (deliveryDto.getStreet() == null || deliveryDto.getStreet().isEmpty())
			throw new InternalServerException("Street missing", HttpStatus.BAD_REQUEST);

		CustomerBillingAddress billingAddress = null;

		if (billingRequestDto.getDifferent()) {

			if (billingRequestDto.getZip() == null || billingRequestDto.getZip().isEmpty())
				throw new InternalServerException("Billing zip code missing", HttpStatus.BAD_REQUEST);
			if (billingRequestDto.getCity() == null || billingRequestDto.getCity().isEmpty())
				throw new InternalServerException("Billing city missing", HttpStatus.BAD_REQUEST);
			if (billingRequestDto.getStreet() == null || billingRequestDto.getStreet().isEmpty())
				throw new InternalServerException("Billing street missing", HttpStatus.BAD_REQUEST);

			billingAddress = CustomerBillingAddress.builder().zip(billingRequestDto.getZip())
					.city(billingRequestDto.getCity()).street(billingRequestDto.getStreet())
					.houseNumber(billingRequestDto.getHouseNumber()).isDifferent(true).build();
		} else {
			billingAddress = CustomerBillingAddress.builder().zip(deliveryDto.getZip()).city(deliveryDto.getCity())
					.street(deliveryDto.getStreet()).houseNumber(deliveryDto.getHouseNumber()).isDifferent(false)
					.build();
		}

		CustomerAddress address = customerAddressRepo.findAddress(customerId, deliveryDto.getZip(),
				deliveryDto.getCity(), deliveryDto.getStreet(), deliveryDto.getHouseNumber()).orElse(null);

		if (address == null) {
			address = CustomerAddress.builder().zip(deliveryDto.getZip()).city(deliveryDto.getCity())
					.street(deliveryDto.getStreet()).houseNumber(deliveryDto.getHouseNumber()).customerId(customer)
					.build();

			customer.addCustomerAddress(address);
		}

		CustomerDelivery delivery = CustomerDelivery.builder().firstName(deliveryDto.getFirstName())
				.lastName(deliveryDto.getLastName()).address(address).billingAddress(billingAddress)
				.mobile(deliveryDto.getMobile()).telephone(deliveryDto.getTelephone())
				.deliveryDate(helper.toGermamUnixTimestamp(deliveryDto.getDeliveryDate())).build();

		customer.addCustomerDelivery(delivery);

		customerRepo.save(customer);

		Integer deliveryId = customer.getCustomerDelivery().getLast().getId();

		return Map.of("res", true, "customerId", customerId, "deliveryId", deliveryId);
	}

	public Map<String, Object> saveConnection(Integer customerId, Integer deliveryId,
			CustomerConnectionRequestDto customerConnectDto) {

		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.BAD_REQUEST);

		if (deliveryId == null || deliveryId <= 0)
			throw new InternalServerException("Devilery id missing", HttpStatus.BAD_REQUEST);

		if (customerConnectDto.getIsMovingIn() == null)
			throw new InternalServerException("Moving in missing", HttpStatus.BAD_REQUEST);

		if (customerConnectDto.getIsMovingIn()) {
			if (customerConnectDto.getMoveInDate() == null)
				throw new InternalServerException("Moving in date missing", HttpStatus.BAD_REQUEST);

			if (customerConnectDto.getMoveInDate().isBefore(LocalDate.now(ZoneId.of("Europe/Berlin"))))
				throw new InternalServerException("Moving in date is past date", HttpStatus.BAD_REQUEST);
		} else {
			if (customerConnectDto.getAutoCancellation() == null)
				throw new InternalServerException("Auto Cancellation missing", HttpStatus.BAD_REQUEST);

			if (customerConnectDto.getAlreadyCancelled() == null)
				throw new InternalServerException("Already cancelled missing", HttpStatus.BAD_REQUEST);

			if (customerConnectDto.getSelfCancellation() == null)
				throw new InternalServerException("Self cancellation missing", HttpStatus.BAD_REQUEST);

			if (customerConnectDto.getDelivery() == null)
				throw new InternalServerException("Delivery option missing", HttpStatus.BAD_REQUEST);

			if (customerConnectDto.getDelivery()) {
				if (customerConnectDto.getDesiredDelivery() == null
						|| customerConnectDto.getDesiredDelivery().isBefore(LocalDate.now(ZoneId.of("Europe/Berlin"))))
					;
				throw new InternalServerException("Desired Delivery not found or ill formed", HttpStatus.BAD_REQUEST);
			}
		}

		if (customerConnectDto.getSubmitLater() == null)
			throw new InternalServerException("Submit later not found", HttpStatus.BAD_REQUEST);

		if (customerConnectDto.getMeterNumber() == null || customerConnectDto.getMeterNumber().isEmpty())
			throw new InternalServerException("Meter number missing", HttpStatus.BAD_REQUEST);

		CustomerDelivery delivery = customerDeliveryRepo.findById(deliveryId)
				.orElseThrow(() -> new InternalServerException("Delivery record not found", HttpStatus.BAD_REQUEST));
		Customer customer = customerRepo.findById(customerId)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.BAD_REQUEST));

		CustomerConnect customerConnect = CustomerConnect.builder().isMovingIn(customerConnectDto.getIsMovingIn())
				.moveInDate(customerConnectDto.getMoveInDate() != null
						? helper.toGermamUnixTimestamp(customerConnectDto.getMoveInDate())
						: null)
				.submitLater(customerConnectDto.getSubmitLater()).meterNumber(customerConnectDto.getMeterNumber())
				.currentProvider(customerConnectDto.getCurrentProvider())
				.autoCancellation(customerConnectDto.getAutoCancellation())
				.alreadyCancelled(customerConnectDto.getAlreadyCancelled())
				.selfCancellation(customerConnectDto.getSelfCancellation()).delivery(customerConnectDto.getDelivery())
				.desiredDelivery(customerConnectDto.getDesiredDelivery() != null
						? helper.toGermamUnixTimestamp(customerConnectDto.getDesiredDelivery())
						: null)
				.marketLocationId(customerConnectDto.getMarketLocationId()).customerDelivery(delivery).build();

		delivery.setCustomerConnection(customerConnect);

		customerDeliveryRepo.save(delivery);
		return Map.of("res", true, "customerId", customerId, "deliveryId", deliveryId);
	}

	public Map<String, Object> fetchCustomer(Integer id) {
		if (id == null || id <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.BAD_REQUEST);

		Customer customer = customerRepo.findById(id)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.BAD_REQUEST));

		return Map.of("res", true, "data", customerResponseMapper.toResponseDto(customer));
	}

}
