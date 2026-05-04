package com.tarifvergleich.electricity.service.customer;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerDelivery;
import com.tarifvergleich.electricity.repository.CustomerDeliveryRepository;
import com.tarifvergleich.electricity.util.EmailTemplate;
import com.tarifvergleich.electricity.util.Helper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerCronTask {

	private final CustomerDeliveryRepository customerDeliveryRepo;
	private final Helper helper;
	private final ApplicationEventPublisher eventPublisher;
	private final EmailTemplate emailTemplate;

	public Map<String, Object> sendExpiryNotification() {

		BigInteger getExpiryDuration = helper.getSecondValueOfDuration(0, 4, 0, 0, 0, 0);

		List<CustomerDelivery> deliveries = customerDeliveryRepo.findRecentExpiryDelivery(false,
				Helper.getCurrentTimeBerlin(), getExpiryDuration);

		deliveries.forEach(delivery -> {

			Customer customer = delivery.getCustomerId();

			if (customer.getIsNotificationEnabled()) {

				Map<String, Object> dateTimeMap = Helper.getLocalDateTimeFromBigInteger(delivery.getExpiryOn());

				String formattedDateTime = dateTimeMap.get("monthName").toString() + " "
						+ dateTimeMap.get("date").toString() + " " + dateTimeMap.get("year").toString() + ", at "
						+ dateTimeMap.get("hour").toString() + ":" + dateTimeMap.get("minute").toString() + " "
						+ dateTimeMap.get("amPm").toString();

				String emailBody = emailTemplate.createBookingExpiryEmailBody(delivery.getSalutation(),
						delivery.getLastName(), delivery.getFirstName(),
						delivery.getCustomerProvider().getProviderName(), formattedDateTime);

				ServiceResponseEmailEvent mailResp = new ServiceResponseEmailEvent(customer.getEmail(),
						"Handlungsbedarf: Ihr Tarif bei " + delivery.getCustomerProvider().getProviderName()
								+ " endet in Kürze",
						emailBody);

				eventPublisher.publishEvent(mailResp);
			}

		});

		return Map.of("res", true, "message", "Notification send successfully to customer");
	}
}
