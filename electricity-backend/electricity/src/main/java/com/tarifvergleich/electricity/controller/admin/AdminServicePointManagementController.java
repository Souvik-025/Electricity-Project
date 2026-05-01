package com.tarifvergleich.electricity.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.ListOfHolidaysDto;
import com.tarifvergleich.electricity.service.admin.AdminServicePointManagementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminServicePointManagementController {

	private final AdminServicePointManagementService adminServicePointManagementService;

	@PostMapping("/add-holidays")
	public ResponseEntity<?> addAndEditHolidays(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminAddHolidays(holidaysDto));
	}

	@PostMapping("/fetch-holidays")
	public ResponseEntity<?> fetchAllHolidays(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminGetHolidayList(holidaysDto.getAdminId(),
				holidaysDto.getYear()));
	}

	@PostMapping("/delete-holiday")
	public ResponseEntity<?> deleteHoliday(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminDeleteHolidays(holidaysDto));
	}
}
