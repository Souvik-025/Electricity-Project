package com.tarifvergleich.electricity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.AdminSignature;

@Repository
public interface AdminSignatureRepository extends JpaRepository<AdminSignature, Integer> {

	Optional<AdminSignature> findByAdminAdminId(Integer adminId);

	Optional<AdminSignature> findByIdAndAdminAdminId(Integer id, Integer adminId);

}
