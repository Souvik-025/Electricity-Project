package com.tarifvergleich.electricity.service.customer;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.tarifvergleich.electricity.dto.CustomerBankAccountDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerBankAccount;
import com.tarifvergleich.electricity.repository.CustomerBankAccountRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerBankAccountService {

	private final CustomerBankAccountRepository customerBankAccountRepo;
	private final CustomerRepository customerRepo;

	public Map<String, Object> addCustomerBankAccount(@RequestBody CustomerBankAccountDto accountDto) {

		if (accountDto == null)
			throw new InternalServerException("Account details missing", HttpStatus.OK);
		if (accountDto.getCustomerId() == null || accountDto.getCustomerId() <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);
		if (accountDto.getAdminId() == null || accountDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);
		if (accountDto.getBankAccountType() == null || (!accountDto.getBankAccountType().equalsIgnoreCase("PRIVATE")
				&& !accountDto.getBankAccountType().equalsIgnoreCase("BUSINESS")
				&& !accountDto.getBankAccountType().equalsIgnoreCase("OTHER")))
			throw new InternalServerException("Bank account type missing", HttpStatus.OK);
		if (accountDto.getIban() == null || accountDto.getIban().isEmpty())
			throw new InternalServerException("Iban missing", HttpStatus.OK);
		if (accountDto.getBic() == null || accountDto.getBic().isEmpty())
			throw new InternalServerException("Bic missing", HttpStatus.OK);
		if (accountDto.getAccountNumber() == null || accountDto.getAccountNumber().isEmpty())
			throw new InternalServerException("Account number missing", HttpStatus.OK);
		if (accountDto.getBankSortCode() == null || accountDto.getBankSortCode().isEmpty())
			throw new InternalServerException("Bank sort code missing", HttpStatus.OK);
		if (accountDto.getBankName() == null || accountDto.getBankName().isEmpty())
			throw new InternalServerException("Bank name missing", HttpStatus.OK);

		if (accountDto.getIsPrimaryBankForCommercialContracts() == null)
			throw new InternalServerException("Primary bank for commercial contract missing", HttpStatus.OK);
		if (accountDto.getIsPrimaryBankForPrivateContracts() == null)
			throw new InternalServerException("Primary bank for private contract missing", HttpStatus.OK);

		Customer customer = customerRepo
				.findByCustomerIdAndAdminAdminId(accountDto.getCustomerId(), accountDto.getAdminId()).orElseThrow(
						() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (!customer.getAdmin().getAdminId().equals(accountDto.getAdminId()))
			throw new InternalServerException("Admin not found", HttpStatus.OK);

		CustomerBankAccount account = null;
		if (accountDto.getBankAccountId() != null && accountDto.getBankAccountId() <= 0) {
			account = customerBankAccountRepo
					.findByIdAndCustomerCustomerId(accountDto.getBankAccountId(), accountDto.getCustomerId())
					.orElseThrow(() -> new InternalServerException("Bank account not found with this credential",
							HttpStatus.OK));
		} else {
			account = CustomerBankAccount.builder().customer(customer).build();
		}

		return Map.of();
	}
}
