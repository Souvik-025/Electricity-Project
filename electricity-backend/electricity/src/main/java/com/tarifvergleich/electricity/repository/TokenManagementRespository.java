package com.tarifvergleich.electricity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.TokenManagement;

@Repository
public interface TokenManagementRespository extends JpaRepository<TokenManagement, Integer> {

	Optional<TokenManagement> findByToken(String token);
}
