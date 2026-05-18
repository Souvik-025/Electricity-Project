package com.tarifvergleich.electricity.repository;

import com.tarifvergleich.electricity.model.AdminTaxManagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminTaxManagementRepository extends JpaRepository<AdminTaxManagement, Long>{

}
