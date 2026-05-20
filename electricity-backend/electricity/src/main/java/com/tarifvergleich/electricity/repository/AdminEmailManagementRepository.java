package com.tarifvergleich.electricity.repository;

import com.tarifvergleich.electricity.model.AdminEmailManagement;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminEmailManagementRepository extends JpaRepository<AdminEmailManagement, Long> {

	List<AdminEmailManagement> findAllByAdminAdminId(Integer adminId);
	Optional<AdminEmailManagement> findByCategoryCateId(Long cateId);

}