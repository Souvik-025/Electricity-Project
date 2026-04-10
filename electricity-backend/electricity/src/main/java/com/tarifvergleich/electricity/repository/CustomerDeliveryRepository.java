package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerDelivery;

@Repository
public interface CustomerDeliveryRepository extends JpaRepository<CustomerDelivery, Integer> {

}
