package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.CustomerServiceRequestMessages;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerServiceRequestMessagesDto {

	private Integer id;
	private String message;
	private String chatUser; // "CUSTOMER" or "ADMIN"
	private BigInteger sendOn;
	private Integer serviceRequestId;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MessageResDto {
		private String message;
		private String chatUser; // "CUSTOMER" or "ADMIN"
		private BigInteger sendOn;
	}

	public static MessageResDto getMessagesResDto(CustomerServiceRequestMessages customerMessage) {
		if (customerMessage == null)
			return null;

		return MessageResDto.builder()
				.message(customerMessage.getMessage())
				.chatUser(customerMessage.getChatUser())
				.sendOn(customerMessage.getSendOn())
				.build();
	}
}
