package com.tarifvergleich.electricity.model;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_bank_accounts")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CustomerBankAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "bank_account_type", comment = "'PRIVATE', 'BUSINESS', 'OTHER'")
	private String bankAccountType;
	
	@Column(name = "iban")
	private String iban;
	
	private String bic;
	
	@Column(name = "account_number")
	private String accountNumber;
	
	@Column(name = "bank_sort_code")
	private String bankSortCode;
	
	@Column(name = "bank_name")
	private String bankName;
	
	@Column(name = "is_primary_bank_for_commercial_contracts")
	private Boolean isPrimaryBankForCommercialContracts;
	
	@Column(name = "is_primary_bank_for_private_contracts")
	private Boolean  isPrimaryBankForPrivateContracts;
	
	@Column(name = "created_on")
	private BigInteger createdOn;
	
	@Column(name = "last_updated_on")
	private BigInteger lastUpdatedOn;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id")
	@JsonIgnore
	private Customer customer;
	
	@PrePersist
	protected void onCreate() {
		createdOn = Helper.getCurrentTimeBerlin();
	}
	
	@PreUpdate
	public void onUpdate() {
		lastUpdatedOn = Helper.getCurrentTimeBerlin();
	}
}
