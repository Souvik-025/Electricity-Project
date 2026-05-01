package com.tarifvergleich.electricity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerAddress;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Integer> {

	@Query(value = "SELECT * FROM customer_address c " + "WHERE c.customer_id = :id " + "AND c.zip LIKE :zip "
			+ "AND c.city LIKE :city " + "AND c.street LIKE :street " + "AND c.house_number LIKE :houseNumber "
			+ "LIMIT 1", nativeQuery = true)
	Optional<CustomerAddress> findAddress(@Param("id") Integer id, @Param("zip") String zip, @Param("city") String city,
			@Param("street") String street, @Param("houseNumber") String houseNumber);

	List<CustomerAddress> findAllByCustomerIdCustomerIdAndZipAndCityAndStreetAndHouseNumber(Integer customerId,
			String zip, String city, String street, String houseNumber);

}
