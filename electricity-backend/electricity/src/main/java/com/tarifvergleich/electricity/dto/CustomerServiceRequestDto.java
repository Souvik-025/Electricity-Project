package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;
import java.util.List;

import com.tarifvergleich.electricity.dto.CustomerServiceRequestMessagesDto.MessageResDto;
import com.tarifvergleich.electricity.model.CustomerServiceRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CustomerServiceRequestDto {

	private Integer serviceRequestId;
	private String serviceRequestType;
	private String title;
	private String message;
	private BigInteger createdOn;

	private Boolean isOpen;
	private Boolean inProgress;
	private Boolean isClosed;

	private BigInteger requestReopenedOn;
	private BigInteger requestClosedOn;

	private Integer serviceId;
	 // To display which service this request belongs to

	private Integer customerId;
	private Integer deliveryId;
	private Integer adminId;
	
	@NoArgsConstructor
	@AllArgsConstructor
	@Data
	@Builder
	public static class CustomerServiceRequestResDtoForMessages{
		private String title;
		private BigInteger createdOn;
		private Boolean isClosed;
		private BigInteger requestClosedOn;
		private String serviceName;
		private List<MessageResDto> messages;
	}
	
	@NoArgsConstructor
	@AllArgsConstructor
	@Data
	@Builder
	public static class CustomerServiceRequestResDtoForListing{
		private Integer serviceRequestId;
		private String title;
		private BigInteger createdOn;
		private Boolean isOpen;
		private Boolean inProgress;
		private Boolean isClosed;
		private BigInteger requestClosedOn;
		private BigInteger requestReopenedOn;
		private String serviceName;
		private String ticketNumber;
	}
	
	public static CustomerServiceRequestResDtoForMessages getAllMessagesRes(CustomerServiceRequest serviceRequest) {
		if(serviceRequest == null) return null;
		
		return CustomerServiceRequestResDtoForMessages.builder()
				.title(serviceRequest.getTitle())
				.createdOn(serviceRequest.getCreatedOn())
				.isClosed(serviceRequest.getIsClosed())
				.requestClosedOn(serviceRequest.getRequestClosedOn())
				.serviceName(serviceRequest.getService().getServiceName())
				.messages(serviceRequest.getCustomerServiceRequestMessages().stream().map(CustomerServiceRequestMessagesDto::getMessagesResDto).toList())
				.build();
	}
	
	public static CustomerServiceRequestResDtoForListing getAllListings(CustomerServiceRequest serviceRequest) {
		if(serviceRequest == null) return null;
		
		return CustomerServiceRequestResDtoForListing.builder()
				.serviceRequestId(serviceRequest.getId())
				.title(serviceRequest.getTitle())
				.createdOn(serviceRequest.getCreatedOn())
				.isClosed(serviceRequest.getIsClosed())
				.requestClosedOn(serviceRequest.getRequestClosedOn())
				.serviceName(serviceRequest.getService().getServiceName())
				.isOpen(serviceRequest.getIsOpen())
				.inProgress(serviceRequest.getInProgress())
				.requestReopenedOn(serviceRequest.getRequestReopenedOn())
				.ticketNumber(serviceRequest.getTicketNumber())
				.build();
	}
	
}
