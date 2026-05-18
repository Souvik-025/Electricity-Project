package com.tarifvergleich.electricity.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.BigInteger;

import com.tarifvergleich.electricity.util.Helper;

@Entity
@Table(name = "admin_tax_management")
public class AdminTaxManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_id")
    private Long taxId;

    @Column(name = "value")
    private BigDecimal value;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    private BigInteger createdDate;

    public Long getTaxId() {
        return taxId;
    }

    public void setTaxId(Long taxId) {
        this.taxId = taxId;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setTax(BigDecimal value) {
        this.value = value;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public BigInteger getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(BigInteger createdDate) {
        this.createdDate = createdDate;
    }
    
    @PrePersist
    protected void onCreate() {
    	createdDate = Helper.getCurrentTimeBerlin();    
    }
}
