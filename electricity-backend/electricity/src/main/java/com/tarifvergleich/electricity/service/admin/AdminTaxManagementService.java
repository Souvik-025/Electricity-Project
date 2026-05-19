package com.tarifvergleich.electricity.service.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.AdminTaxManagementDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminTaxManagement;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.repository.AdminTaxManagementRepository;
import com.tarifvergleich.electricity.repository.AdminUserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminTaxManagementService {

	private final AdminTaxManagementRepository taxrepository;
	private final AdminUserRepository adminUserRepo;

	@Transactional
	public AdminTaxManagement saveTax(AdminTaxManagementDto tax) {

		if (tax.getValue() == null || tax.getValue().doubleValue() < 0) {
			throw new InternalServerException("Tax value cannot be empty", HttpStatus.OK);
		}
		if (tax.getAdminId() == null || tax.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		if (tax.getTaxId() != null && tax.getTaxId() > 0) {
			AdminTaxManagement adminTax = taxrepository.findByTaxIdAndAdminAdminId(tax.getTaxId(), tax.getAdminId())
					.orElseThrow(
							() -> new InternalServerException("Tax not found with this credential", HttpStatus.OK));

			adminTax.setValue(tax.getValue());

			adminTax = taxrepository.save(adminTax);

			return adminTax;
		}

		AdminUser admin = adminUserRepo.findById(tax.getAdminId())
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		AdminTaxManagement adminTax = AdminTaxManagement.builder().value(tax.getValue()).admin(admin).build();

		adminTax = taxrepository.save(adminTax);

		return adminTax;
	}

	public List<AdminTaxManagement> getAllTaxs() {
		return taxrepository.findAll();
	}

	public AdminTaxManagement getLatestTax() {
		List<AdminTaxManagement> list = taxrepository.findAll();
		if (list.isEmpty()) {
			return null;
		}
		return list.get(list.size() - 1);
	}
}