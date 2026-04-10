package com.tarifvergleich.electricity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerAddress;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Integer> {
	
	@Query("SELECT c FROM CustomerAddress c WHERE c.customerId.customerId = :id " +
		       "AND c.zip LIKE :zip " +
		       "AND c.city LIKE :city " +
		       "AND c.street LIKE :street " +
		       "AND c.houseNumber LIKE :houseNumber")
		Optional<CustomerAddress> findAddress(
		    @Param("id") Integer id, 
		    @Param("zip") String zip, 
		    @Param("city") String city, 
		    @Param("street") String street, 
		    @Param("houseNumber") String houseNumber
		);

}
