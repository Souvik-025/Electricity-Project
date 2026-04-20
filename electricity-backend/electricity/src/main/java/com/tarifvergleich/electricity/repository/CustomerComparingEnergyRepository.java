package com.tarifvergleich.electricity.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerComparingEnergy;

@Repository
public interface CustomerComparingEnergyRepository extends JpaRepository<CustomerComparingEnergy, Integer> {

	Page<CustomerComparingEnergy> findAllByAdminAdminId(Integer adminId, Pageable pageable);
	List<CustomerComparingEnergy> findAllByAdminAdminIdOrderByIdDesc(Integer adminId);
}
