package com.tarifvergleich.electricity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.AdminEmailRequestCategory;

@Repository
public interface AdminEmailRequestCategoryRepository extends JpaRepository<AdminEmailRequestCategory, Long> {

	List<AdminEmailRequestCategory> findAllByAdminAdminIdOrderByNameAsc(Integer adminId);

	Optional<AdminEmailRequestCategory> findByCateIdAndAdminAdminId(Long cateId, Integer adminId);

}