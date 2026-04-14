//package com.tarifvergleich.electricity.service;
//
//import java.util.Map;
//import java.util.concurrent.CompletableFuture;
//import java.util.concurrent.ExecutionException;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Service;
//
//import com.tarifvergleich.electricity.exception.InternalServerException;
//import com.tarifvergleich.electricity.model.Customer;
//import com.tarifvergleich.electricity.model.CustomerComparingEnergy;
//import com.tarifvergleich.electricity.repository.CustomerComparingEnergyRepository;
//import com.tarifvergleich.electricity.repository.CustomerRepository;
//import com.tarifvergleich.electricity.util.Helper;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//
//@Service
//@RequiredArgsConstructor
//public class ElectricityComparisonService {
//
//	private final EnergyService energyService;
//	private final CustomerComparingEnergyRepository comparingRepo;
//	private final CustomerRepository customerRepo;
//	private final Helper helper;
//
//	@Transactional
//	public Map<String, Object> getElectricityComparison(Map<String, Object> filters, String userAgentString,
//			HttpServletRequest request) {
//		try {
//
//			CustomerComparingEnergy customerCompare = null;
//			Integer customerId = 0;
//			Customer customer;
//
//			if (filters.get("isSave") == null || Boolean.parseBoolean(filters.get("isSave").toString()) == true) {
//
//				customerCompare = CustomerComparingEnergy.builder().zip(filters.get("zip").toString())
//						.city(filters.get("city").toString()).requestIp(helper.getIp(request))
//						.requestDeviceDetails(helper.getDeviceInfo(userAgentString).toString()).build();
//
//				if (filters.get("houseNumber") != null)
//					customerCompare.setHouseNumber(filters.get("houseNumber").toString());
//				if (filters.get("consum") != null)
//					customerCompare.setConsumption(filters.get("consum").toString());
//				if (filters.get("type") != null)
//					customerCompare.setConsumerType(filters.get("type").toString());
//				if (filters.get("street") != null)
//					customerCompare.setStreet(filters.get("street").toString());
//				if(filters.get("branch") != null)
//					customerCompare.setBranch(filters.get("branch").toString());
//				
//
//				customerId = filters.containsKey("customerId") ? (Integer) filters.remove("customerId") : 0;
//			} else {
//				filters.remove("isSave");
//				filters.remove("customerId");
//			}
//
//			CompletableFuture<Object> ratesFuture = CompletableFuture
//					.supplyAsync(() -> energyService.getRates(filters));
//
//			CompletableFuture<Object> providersFuture = CompletableFuture
//					.supplyAsync(() -> energyService.getProviders(filters));
//
//			CompletableFuture.allOf(ratesFuture, providersFuture).join();
//			
//			Object rateData = ratesFuture.get();
//			Object providerData = providersFuture.get();
//
//			if (customerCompare != null) {
//
////				if (customerId < 0) {
////					customer = customerRepo.findById(customerId).orElse(null);
////					if (customer != null) {
////						customerCompare.setCustomerModel(customer);
////					} else {
////						customerCompare.setCustomer(customer);
////					}
////
////				}
//				
//				if (customerId > 0) {
//				    customerRepo.findById(customerId)
//				        .ifPresent(customerCompare::setCustomerModel);
//				}
//				
////				customerCompare.setEnergyRateResponse(null);
////			    customerCompare.setBaseProviderResponse(null);
//
//				comparingRepo.save(customerCompare);
//
//			}
//
//			return Map.of("res", true, "rates", ratesFuture.get(), "baseProvider", providersFuture.get());
//		} catch (InterruptedException e) {
//			e.printStackTrace();
//			throw new InternalServerException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (ExecutionException e) {
//			e.printStackTrace();
//			throw new InternalServerException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//}


package com.tarifvergleich.electricity.service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerComparingEnergy;
import com.tarifvergleich.electricity.repository.CustomerComparingEnergyRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ElectricityComparisonService {

    private final EnergyService energyService;
    private final CustomerComparingEnergyRepository comparingRepo;
    private final CustomerRepository customerRepo;
    private final Helper helper;

    @Transactional
    public Map<String, Object> getElectricityComparison(
            Map<String, Object> filters,
            String userAgentString,
            HttpServletRequest request) {

        try {

            CustomerComparingEnergy customerCompare = null;
            Integer customerId = 0;

            Object customerIdObj = filters.remove("customerId");
            if (customerIdObj != null) {
                try {
                    customerId = Integer.parseInt(customerIdObj.toString());
                } catch (NumberFormatException e) {
                    customerId = 0;
                }
            }

            boolean isSave = true;
            if (filters.get("isSave") != null) {
                isSave = Boolean.parseBoolean(filters.get("isSave").toString());
            }

            if (isSave) {

                customerCompare = CustomerComparingEnergy.builder()
                        .zip(filters.get("zip") != null ? filters.get("zip").toString() : null)
                        .city(filters.get("city") != null ? filters.get("city").toString() : null)
                        .requestIp(helper.getIp(request))
                        .requestDeviceDetails(helper.getDeviceInfo(userAgentString).toString())
                        .build();

                if (filters.get("houseNumber") != null)
                    customerCompare.setHouseNumber(filters.get("houseNumber").toString());

                if (filters.get("consum") != null)
                    customerCompare.setConsumption(filters.get("consum").toString());

                if (filters.get("type") != null)
                    customerCompare.setConsumerType(filters.get("type").toString());

                if (filters.get("street") != null)
                    customerCompare.setStreet(filters.get("street").toString());

                if (filters.get("branch") != null)
                    customerCompare.setBranch(filters.get("branch").toString());

                if (customerId > 0) {
                    Customer customer = customerRepo.findById(customerId).orElse(null);
                    if (customer != null) {
                        customerCompare.setCustomerModel(customer);
                    }
                }

            } else {
                filters.remove("isSave");
            }

            CompletableFuture<Object> ratesFuture =
                    CompletableFuture.supplyAsync(() -> energyService.getRates(filters));

            CompletableFuture<Object> providersFuture =
                    CompletableFuture.supplyAsync(() -> energyService.getProviders(filters));

            CompletableFuture.allOf(ratesFuture, providersFuture).join();

            Object rateData = ratesFuture.get();
            Object providerData = providersFuture.get();

            if (customerCompare != null) {
                comparingRepo.save(customerCompare);
            }

            return Map.of(
                    "res", true,
                    "rates", rateData,
                    "baseProvider", providerData
            );

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            throw new InternalServerException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}