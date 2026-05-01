package com.tarifvergleich.electricity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerSelectedProvider;

@Repository
public interface CustomerSelectedProviderRepository extends JpaRepository<CustomerSelectedProvider, Integer> {

	List<CustomerSelectedProvider> findAllByDeliveryIdAndProviderId(Integer deliveryId, Integer providerId);
}
