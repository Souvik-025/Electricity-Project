package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.CustomerBankAccount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class CustomerBankAccountDto {

	private Integer bankAccountId;
	private String bankAccountType;
	private String iban;
	private String bic;
	private String accountNumber;
	private String bankSortCode;
	private String bankName;
	private Boolean isPrimaryBankForCommercialContracts;
	private Boolean isPrimaryBankForPrivateContracts;
	private BigInteger createdOn;
	private BigInteger lastUpdatedOn;

	private Integer customerId;
	private Integer adminId;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class CustomerBankAccountForProfileDto {
		private Integer bankAccountId;
		private String bankAccountType;
		private String iban;
		private String bic;
		private String accountNumber;
		private String bankSortCode;
		private String bankName;
		private Boolean isPrimaryBankForCommercialContracts;
		private Boolean isPrimaryBankForPrivateContracts;
	}

	public static CustomerBankAccountForProfileDto mapResponseForProfile(CustomerBankAccount account) {
		if (account == null)
			return null;

		return CustomerBankAccountForProfileDto.builder().bankAccountId(account.getId())
				.bankAccountType(account.getBankAccountType()).iban(account.getIban()).bic(account.getBic())
				.accountNumber(account.getAccountNumber()).bankSortCode(account.getBankSortCode())
				.bankName(account.getBankName())
				.isPrimaryBankForCommercialContracts(account.getIsPrimaryBankForCommercialContracts())
				.isPrimaryBankForPrivateContracts(account.getIsPrimaryBankForPrivateContracts()).build();
	}
}
