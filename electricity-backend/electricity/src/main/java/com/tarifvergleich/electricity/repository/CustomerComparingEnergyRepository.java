package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerComparingEnergy;

@Repository
public interface CustomerComparingEnergyRepository extends JpaRepository<CustomerComparingEnergy, Integer> {

}
