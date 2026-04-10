package com.tarifvergleich.electricity.model;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer_connection")
@Getter
@Setter
@Entity
public class CustomerConnect {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "moving_in_to_address_provider")
	private Boolean isMovingIn;
	
	@Column(name = "move_in_date")
	private BigInteger moveInDate;
	
	@Column(name = "submit_later")
	private Boolean submitLater;
	
	@Column(name = "meter_number")
	private String meterNumber;
	
	@Column(name = "current_provider")
	private String currentProvider;
	
	@Column(name = "auto_cancellation")
	private Boolean autoCancellation;
	
	@Column(name = "already_cancelled")
	private Boolean alreadyCancelled;
	
	@Column(name = "self_cancellation")
	private Boolean selfCancellation;
	
	@Column(name = "delivery_scheduled")
	private Boolean delivery;
	
	@Column(name = "desired_delivery")
	private BigInteger desiredDelivery;
	
	@Column(name = "market_location_id")
	private String marketLocationId;
	
	@OneToOne(mappedBy = "customerConnection")
	@JsonIgnore
	private CustomerDelivery customerDelivery;
	
	private BigInteger createdOn;
	
	@PrePersist
	protected void onCreate() {
		createdOn = Helper.getCurrentTimeBerlin();
	}
	
}
