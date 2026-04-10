package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerBillingAddress;

@Repository
public interface CustomerBillingAddressRepository extends JpaRepository<CustomerBillingAddress, Integer> {

}
