package com.tarifvergleich.electricity.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.service.ElectricityComparisonService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class EnergyRateController {

	private final ElectricityComparisonService electricityComparisonService;
	
	@PostMapping("/get-rates")
	public ResponseEntity<?> getRates(@RequestBody Map<String, Object> payload, @RequestHeader("User-Agent") String userAgentString, HttpServletRequest request){
		return ResponseEntity.ok(electricityComparisonService.getElectricityComparison(payload, userAgentString, request));
	}
}
