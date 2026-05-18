package com.tarifvergleich.electricity.service.admin;

import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminTaxManagement;
import com.tarifvergleich.electricity.repository.AdminTaxManagementRepository;
import com.tarifvergleich.electricity.util.Helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminTaxManagementService {

    @Autowired
    private AdminTaxManagementRepository taxrepository;

    public AdminTaxManagement saveTax(AdminTaxManagement tax) {

    	if(tax.getValue() == null || tax.getValue().doubleValue() < 0) {
    		throw new InternalServerException("Tax value cannot be empty", HttpStatus.OK);
    	}
    	
        tax.setCreatedDate(Helper.getCurrentTimeBerlin());

        return taxrepository.save(tax);
    }

    public List<AdminTaxManagement> getAllTaxs() {
        return taxrepository.findAll();
    }
    
    public AdminTaxManagement getLatestTax() {
    	List<AdminTaxManagement> list = taxrepository.findAll();
    	
    	if(list.isEmpty())
    	{
    		return null;
    	}
    	
    	return list.get(list.size() - 1);
    }
}