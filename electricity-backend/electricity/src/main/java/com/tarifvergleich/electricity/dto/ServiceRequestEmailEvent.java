package com.tarifvergleich.electricity.dto;

public record ServiceRequestEmailEvent(String customerMail, String customerSub, String customerBody,
	    String adminMail, String adminSub, String adminBody) {
	
	public record ServiceResponseEmailEvent(String customerMail, String customerSub, String customerBody) {}

}
