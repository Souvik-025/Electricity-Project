package com.tarifvergleich.electricity.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceRequestEmailListener {

	private final MailService mailService;

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleServiceRequestEmail(ServiceRequestEmailEvent event) {
		mailService.sendMail(event.customerMail(), event.customerSub(), event.customerBody());
		mailService.sendMail(event.adminMail(), event.adminSub(), event.adminBody());
	}
	
	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleServiceResponseEmail(ServiceResponseEmailEvent event) {
		mailService.sendMail(event.customerMail(), event.customerSub(), event.customerBody());
	}
}
