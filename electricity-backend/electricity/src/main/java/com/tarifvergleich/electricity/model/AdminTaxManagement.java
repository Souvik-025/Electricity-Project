package com.tarifvergleich.electricity.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

@Entity
@Table(name = "admin_tax_management")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTaxManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_id")
    private Long taxId;

    @Column(name = "value")
    private BigDecimal value;

    @Column(name = "created_date")
    private BigInteger createdDate;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;

    @PrePersist
    protected void onCreate() {
    	createdDate = Helper.getCurrentTimeBerlin();    
    }
}
