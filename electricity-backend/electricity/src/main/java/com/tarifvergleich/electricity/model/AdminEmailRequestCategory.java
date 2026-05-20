package com.tarifvergleich.electricity.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

@Entity
@Table(name = "email_request_category")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEmailRequestCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cate_id")
    private Long cateId;

    @Column(name = "name")
    private String name;

    @Column(name = "created_date")
    private BigInteger createdDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;
    
    @Column(name = "category_slug")
    private String categorySlug;
    
    @PrePersist
    protected void onCreate() {
    	createdDate = Helper.getCurrentTimeBerlin();    
    }
}