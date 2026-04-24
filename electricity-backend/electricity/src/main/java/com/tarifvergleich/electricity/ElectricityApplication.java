package com.tarifvergleich.electricity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ElectricityApplication {

	public static void main(String[] args) {
		SpringApplication.run(ElectricityApplication.class, args);
	}

}
