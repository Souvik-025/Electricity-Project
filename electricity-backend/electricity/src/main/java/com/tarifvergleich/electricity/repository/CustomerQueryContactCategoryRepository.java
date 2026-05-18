package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerQueryContactCategory;

@Repository
public interface CustomerQueryContactCategoryRepository extends JpaRepository<CustomerQueryContactCategory, Integer> {

}
