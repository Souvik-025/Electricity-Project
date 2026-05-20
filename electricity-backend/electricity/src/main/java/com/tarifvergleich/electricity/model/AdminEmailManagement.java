package com.tarifvergleich.electricity.model;

import jakarta.persistence.*;

import java.util.List;

import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

@Entity
@Table(name = "email_management")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminEmailManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "subtitle")
    private String subtitle;

    @Column(name = "email_content", columnDefinition = "TEXT")
    private String emailContent;

    @Column(name = "created_date")
    private BigInteger createdDate;

    @ManyToOne
    @JoinColumn(name = "cate_id")
    @JsonIgnore
    private AdminEmailRequestCategory category;
    
    @ManyToMany
    @JoinTable(
        name = "email_management_documents", joinColumns = @JoinColumn(name = "email_management_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    @JsonIgnore
    private List<ManageAdminDocument> documents;
    
    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;
	
	@PrePersist
	protected void onCreate() {
		createdDate = Helper.getCurrentTimeBerlin();
	}

}