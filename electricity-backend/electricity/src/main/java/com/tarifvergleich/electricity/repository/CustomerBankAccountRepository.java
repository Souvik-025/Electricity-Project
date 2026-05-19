package com.tarifvergleich.electricity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerBankAccount;

@Repository
public interface CustomerBankAccountRepository extends JpaRepository<CustomerBankAccount, Integer> {

	Optional<CustomerBankAccount> findByIdAndCustomerCustomerId(Integer id, Integer customerId);
}
