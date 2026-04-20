package com.tarifvergleich.electricity.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerDelivery;

@Repository
public interface CustomerDeliveryRepository extends JpaRepository<CustomerDelivery, Integer> {

	
	Page<CustomerDelivery> findAllByAdminAdminId(Integer adminId, Pageable pageable);
	List<CustomerDelivery> findAllByAdminAdminIdOrderByOrderPlacedOnDesc(Integer adminId);
}
