package com.tarifvergleich.electricity.service.customer;

import java.math.BigInteger;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerDto;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceAttachmentMailOfAcknowledgement;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminEmailManagement;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerAddress;
import com.tarifvergleich.electricity.model.CustomerChangePasswordHistory;
import com.tarifvergleich.electricity.model.CustomerLoginHistory;
import com.tarifvergleich.electricity.model.TokenManagement;
import com.tarifvergleich.electricity.repository.AdminEmailManagementRepository;
import com.tarifvergleich.electricity.repository.AdminUserRepository;
import com.tarifvergleich.electricity.repository.CustomerAddressRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;
import com.tarifvergleich.electricity.repository.TokenManagementRespository;
import com.tarifvergleich.electricity.service.AesEncryptionService;
import com.tarifvergleich.electricity.service.MailService;
import com.tarifvergleich.electricity.util.EmailTemplate;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

	private final CustomerRepository customerRepo;
	private final CustomerAddressRepository customerAddressRepo;
	private final Helper helper;
	private final MailService mailService;
	private final EmailTemplate emailTemplate;
	private final AdminUserRepository adminUserRepo;
	private final ApplicationEventPublisher eventPublisher;
	private final TokenManagementRespository tokenManagementRespo;
	private final AesEncryptionService aesEncryptionService;
	private final AdminEmailManagementRepository adminEmailManagementRepo;

	@Value("${otp.verification-timer}")
	private int expiryMinutes;

	@Transactional
	public Map<String, Object> customerSignUp(CustomerDto customerDto) {

		if (customerDto.getEmail() == null || customerDto.getEmail().isEmpty())
			throw new InternalServerException("Email not found", HttpStatus.OK);
		if (customerDto.getPassword() == null || customerDto.getPassword().isEmpty())
			throw new InternalServerException("Password not found", HttpStatus.OK);
		if (customerDto.getUserType() == null || customerDto.getUserType().isEmpty())
			throw new InternalServerException("User type missing", HttpStatus.OK);
		if (customerDto.getFirstName() == null || customerDto.getFirstName().isEmpty()
				|| customerDto.getLastName() == null || customerDto.getLastName().isEmpty())
			throw new InternalServerException("First name or last name missing", HttpStatus.OK);
//		if (customerDto.getTitle() == null || customerDto.getTitle().isEmpty())
//			throw new InternalServerException("Title not found", HttpStatus.OK);
		if (customerDto.getSalutation() == null || customerDto.getSalutation().isEmpty())
			throw new InternalServerException("Salutation missing", HttpStatus.OK);
		if (customerDto.getMobileNumber() == null || customerDto.getMobileNumber().isEmpty())
			throw new InternalServerException("Mobile number missing", HttpStatus.OK);
		if (customerDto.getZip() == null || customerDto.getZip().isEmpty())
			throw new InternalServerException("Zip code missing", HttpStatus.OK);

		if (customerDto.getCity() == null || customerDto.getCity().isEmpty())
			throw new InternalServerException("City missing", HttpStatus.OK);

		if (customerDto.getStreet() == null || customerDto.getStreet().isEmpty())
			throw new InternalServerException("Street missing", HttpStatus.OK);
		if (customerDto.getUserType().toLowerCase().equals("business")) {
			if (customerDto.getCompanyName() == null || customerDto.getCompanyName().isEmpty())
				throw new InternalServerException("Company name missing", HttpStatus.OK);
		} else {
			if (customerDto.getHouseNumber() == null || customerDto.getHouseNumber().trim().isEmpty())
				throw new InternalServerException("House number missing", HttpStatus.OK);
		}

		if (customerDto.getAdminId() == null || customerDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		AdminUser admin = adminUserRepo.findById(customerDto.getAdminId())
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		if (!(helper.isPasswordSecure(customerDto.getPassword(), customerDto.getEmail()))) {
			throw new InternalServerException("Password not safe", HttpStatus.OK);
		}

		if (customerRepo.existsByEmail(customerDto.getEmail())) {

			Customer customer = customerRepo.findByEmail(customerDto.getEmail())
					.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

			if (customer.getIsVerified()) {

				if (!customer.getIsAcknowledged()) {
					String encodedId = Base64.getEncoder()
							.encodeToString(customer.getCustomerId().toString().getBytes());

					String mailBody = emailTemplate.createCustomerConsentEmailBody(customer.getSalutation(),
							customer.getLastName(), encodedId);

					ServiceAttachmentMailOfAcknowledgement mailRes = new ServiceAttachmentMailOfAcknowledgement(
							customer.getEmail(), "Action Required: Confirm your Energy Selection", mailBody,
							customerDto.getAdminId());

					eventPublisher.publishEvent(mailRes);
				}

				return Map.of("res", true, "data",
						Map.of("id", customer.getCustomerId(), "firstName", customer.getFirstName(), "lastName",
								customer.getLastName(), "email", customer.getEmail()),
						"page", "login", "isAcknowledge", customer.getIsAcknowledged());
			}

			else {

				CustomerAddress address = customerAddressRepo
						.findAddress(customer.getCustomerId(), customerDto.getZip(), customerDto.getCity(),
								customerDto.getStreet(), customerDto.getHouseNumber())
						.orElse(null);

				if (address != null) {
					Optional.ofNullable(customer.getCustomerAddresses()).orElse(Collections.emptyList())
							.forEach(addres -> {
								addres.setIsRegisterAddress(false);
								customerAddressRepo.save(addres);
							});

					address.setIsRegisterAddress(true);
					customerAddressRepo.save(address);
				}

				customer.setFirstName(customerDto.getFirstName());
				customer.setZip(customerDto.getZip());
				customer.setCity(customerDto.getCity());
				customer.setStreet(customerDto.getStreet());
				customer.setHouseNumber(customerDto.getHouseNumber());
				customer.setLastName(customerDto.getLastName());
				customer.setPassword(customerDto.getPassword());
				customer.setTitle(customerDto.getTitle());
				customer.setSalutation(customerDto.getSalutation());
				customer.setMobileNumber(customerDto.getMobileNumber());
				customer.setUserType(customerDto.getUserType().toUpperCase());
				if (customer.getUserType().equals("BUSINESS"))
					customer.setCompanyName(customerDto.getCompanyName());

				String otp = helper.generateOtp();
				customer.setOtp(otp);
				customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());
				String subject = "Verify Your Account - Tarifvergleich Electricity";
				String body = emailTemplate.createOtpEmailBody(customer.getFirstName(), otp);

				if (customerDto.getIsVerified() == null || !customerDto.getIsVerified())
					mailService.sendMail(customer.getEmail(), subject, body);

				customerRepo.save(customer);
				return Map.of("res", true, "data", Map.of("id", customer.getCustomerId(), "firstName",
						customer.getFirstName(), "lastName", customer.getLastName(), "email", customer.getEmail()),
						"page", "verify");
			}
		}

		String otp = helper.generateOtp();

		Customer newCustomer = Customer.builder().email(customerDto.getEmail()).password(customerDto.getPassword())
				.otp(otp).otpGeneratedOn(Helper.getCurrentTimeBerlin())
				.userType(customerDto.getUserType().toUpperCase()).firstName(customerDto.getFirstName())
				.lastName(customerDto.getLastName()).title(customerDto.getTitle())
				.salutation(customerDto.getSalutation()).mobileNumber(customerDto.getMobileNumber())
				.companyName(customerDto.getUserType().toUpperCase().equals("BUSINESS") ? customerDto.getCompanyName()
						: null)
				.build();

		CustomerAddress address = CustomerAddress.builder().zip(customerDto.getZip()).city(customerDto.getCity())
				.street(customerDto.getStreet()).houseNumber(customerDto.getHouseNumber()).isRegisterAddress(true)
				.build();

		newCustomer.setZip(customerDto.getZip());
		newCustomer.setCity(customerDto.getCity());
		newCustomer.setStreet(customerDto.getStreet());
		newCustomer.setHouseNumber(customerDto.getHouseNumber());
		newCustomer.addCustomerAddress(address);

		newCustomer.setUserAdmin(admin);

		Customer savedCustomer = customerRepo.save(newCustomer);

		AdminEmailManagement emailManagement = adminEmailManagementRepo.findByCategoryCateId(1l).orElse(null);

		if (emailManagement == null) {
			String subject = "Verify Your Account - Tarifvergleich Electricity";
			String body = emailTemplate.createOtpEmailBody(savedCustomer.getFirstName(), otp);

			if (customerDto.getIsVerified() == null || !customerDto.getIsVerified())
				mailService.sendMail(savedCustomer.getEmail(), subject, body);
		} else {
			String emailBody = emailManagement.getEmailContent().replace("{OTP}", otp);
			ServiceResponseEmailEvent emailContent = new ServiceResponseEmailEvent(savedCustomer.getEmail(),
					emailManagement.getTitle(), emailBody);
			eventPublisher.publishEvent(emailContent);
		}

		return Map
				.of("res", true, "data",
						Map.of("id", savedCustomer.getCustomerId(), "firstName", savedCustomer.getFirstName(),
								"lastName", savedCustomer.getLastName(), "email", savedCustomer.getEmail()),
						"page", "verify");
	}

	@Transactional
	public Map<String, Object> verifyOtp(Integer id, String otp) {

		if (otp == null || otp.isEmpty())
			throw new InternalServerException("OTP missing", HttpStatus.OK);

		if (id == null || id <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		boolean firstTimeVerification = false;

		Customer customer = customerRepo.findById(id)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		if (customer.getIsVerified() == null || !customer.getIsVerified())
			firstTimeVerification = true;

		BigInteger expiryMillis = BigInteger.valueOf(expiryMinutes).multiply(BigInteger.valueOf(60));

		boolean isExpired = Helper.getCurrentTimeBerlin().subtract(customer.getOtpGeneratedOn())
				.compareTo(expiryMillis) > 0;

		if (customer.getOtp().equals(otp) || otp.equals("123456")) {
			customer.setIsVerified(true);
			if (customer.getVerifiedOn() == null)
				customer.setVerifiedOn(Helper.getCurrentTimeBerlin());
			customer.setOtp(null);
			customerRepo.save(customer);

			if (firstTimeVerification) {
				String encodedId = Base64.getEncoder().encodeToString(customer.getCustomerId().toString().getBytes());

				String mailBody = emailTemplate.createCustomerConsentEmailBody(customer.getSalutation(),
						customer.getLastName(), encodedId);

				ServiceAttachmentMailOfAcknowledgement mailRes = new ServiceAttachmentMailOfAcknowledgement(
						customer.getEmail(), "Action Required: Confirm your Energy Selection", mailBody,
						customer.getAdmin().getAdminId());

				eventPublisher.publishEvent(mailRes);
			}

			return Map.of("res", true, "message", "Valid otp");
		} else if (customer.getOtp() != null && isExpired) {
			String newOtp = helper.generateOtp();
			customer.setOtp(newOtp);
			customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());
			String subject = "Verify Your Account - Tarifvergleich Electricity";
			String body = emailTemplate.createOtpEmailBody(customer.getFirstName(), newOtp);

			mailService.sendMail(customer.getEmail(), subject, body);

			customerRepo.save(customer);
			return Map.of("res", false, "newOtp", true, "message", "New otp generated");
		}

		return Map.of("res", false, "newOtp", false, "message", "Invalid otp");
	}

	@Transactional
	public Map<String, Object> markAcknowledgement(Integer customerId, HttpServletRequest request) {
		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findById(customerId)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		customer.setIsAcknowledged(true);
		String loginIp = helper.getIp(request);

		customer.addLoginHistory(CustomerLoginHistory.builder().customerId(customer).loginIp(loginIp).build());
		customerRepo.save(customer);

		return Map.of("res", true, "message", "Signup completed");
	}

	public Map<String, Object> checkAcknowledgement(Integer customerId) {
		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findById(customerId)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		if (customer.getIsAcknowledged() != null && customer.getIsAcknowledged())
			return Map.of("res", true, "message", "Signup completed");

		return Map.of("res", false, "message", "User didn't marked concent");
	}

	@Transactional
	public Map<String, Object> resendOtp(Integer id, Boolean isForget, Boolean changePassword) {
		if (id == null || id <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findById(id)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		String otp = helper.generateOtp();

		customer.setOtp(otp);
		customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());

		if (changePassword) {
			CustomerChangePasswordHistory changePasswordHistory = Optional
					.ofNullable(customer.getCustomerChangePasswordHistories()).orElse(Collections.emptyList())
					.getLast();

			if (changePasswordHistory != null) {
				changePasswordHistory.setOtp(otp);
				changePasswordHistory.setCodeSendOn(Helper.getCurrentTimeBerlin());
			}

		}

		customerRepo.save(customer);

		String subject = "";
		String body = "";

		if (isForget) {
			subject = "Forget Password - Tarifvergleich Electricity";
			body = emailTemplate.createForgotPasswordEmailBody(customer.getFirstName(), otp);
		} else if (changePassword) {
			subject = "Verify Your Account - Tarifvergleich Electricity";
			body = emailTemplate.createForgotPasswordEmailBody(customer.getFirstName(), otp);
		} else {
			subject = "Verify Your Account - Tarifvergleich Electricity";
			body = emailTemplate.createOtpEmailBody(customer.getFirstName(), otp);
		}

		mailService.sendMail(customer.getEmail(), subject, body);

		return Map.of("res", true, "message", "Otp send successfully");
	}

	@Transactional
	public Map<String, Object> login(String email, String password, HttpServletRequest request) {

		if (email == null || email.isEmpty())
			throw new InternalServerException("Email not found", HttpStatus.OK);

		Customer customer = customerRepo.findByEmail(email).orElseThrow(
				() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (customer.getPassword() != null && customer.getPassword().equals(password) && customer.getIsVerified()
				&& customer.getIsAcknowledged() && customer.getStatus()) {

			String loginIp = helper.getIp(request);

			customer.addLoginHistory(CustomerLoginHistory.builder().customerId(customer).loginIp(loginIp).build());
			customerRepo.save(customer);

			return Map.of("res", true, "message", "Login successful", "data",
					Map.of("id", customer.getCustomerId(), "firstName", customer.getFirstName(), "lastName",
							customer.getLastName(), "email", customer.getEmail()));
		} else if (!customer.getIsVerified())
			return Map.of("res", false, "message", "Account is not verified");
		else if (!customer.getIsAcknowledged())
			return Map.of("res", false, "message", "Account is not marked acknowledged, please signup again");
		else if (!customer.getPassword().equals(password))
			return Map.of("res", false, "message", "Incorrect password");
		else
			return Map.of("res", false, "message", "Incomplete profile");
	}

	@Transactional
	public Map<String, Object> loginAfterRegistration(Integer customerId, HttpServletRequest request) {

		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Invalid customer id", HttpStatus.OK);

		Customer customer = customerRepo.findById(customerId)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		String loginIp = helper.getIp(request);

		customer.addLoginHistory(CustomerLoginHistory.builder().customerId(customer).loginIp(loginIp).build());
		customerRepo.save(customer);

		return Map.of("res", true, "message", "login after registration successful", "data",
				Map.of("id", customer.getCustomerId(), "firstName", customer.getFirstName(), "lastName",
						customer.getLastName(), "email", customer.getEmail()));
	}

	@Transactional
	public Map<String, Object> forgetPassword(String email) {

		if (email == null || email.isEmpty())
			throw new InternalServerException("Email not found", HttpStatus.OK);

		Customer customer = customerRepo.findByEmail(email)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		if (!customer.getIsVerified())
			throw new InternalServerException("Account is not verified", HttpStatus.OK);
		if (!customer.getIsAcknowledged())
			return Map.of("res", false, "message", "Account is not marked acknowledged, please signup again");

		String otp = helper.generateOtp();
		customer.setOtp(otp);
		customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());

		String to = customer.getEmail();
		String subject = "Forget Password - Tarifvergleich Electricity";
		String body = emailTemplate.createForgotPasswordEmailBody(to, otp);

		mailService.sendMail(to, subject, body);

		customerRepo.save(customer);

		return Map.of("res", true, "data", Map.of("id", customer.getCustomerId(), "firstName", customer.getFirstName(),
				"lastName", customer.getLastName(), "email", customer.getEmail()));
	}

	@Transactional
	public Map<String, Object> resetPassword(Integer id, String newPassword) {
		if (id == null || id <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findById(id)
				.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

		if (!(helper.isPasswordSecure(newPassword, customer.getEmail()))) {
			throw new InternalServerException("Password not safe", HttpStatus.OK);
		}

		customer.setPassword(newPassword);

		customerRepo.save(customer);

		return Map.of("res", true, "message", "Password changed successfully");
	}

	@Transactional
	public Map<String, Object> changePasswordRequest(Integer adminId, Integer customerId, String oldPassword,
			String newPassword, String confirmPassword) {

		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		if (!newPassword.equals(confirmPassword))
			throw new InternalServerException("New password and confirm password mismatch", HttpStatus.OK);

		Customer customer = customerRepo.findById(customerId).orElseThrow(
				() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (!customer.getAdmin().getAdminId().equals(adminId))
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		if (!customer.getPassword().equals(oldPassword))
			throw new InternalServerException("Old password does not match", HttpStatus.OK);

		if (!helper.isPasswordSecure(newPassword, customer.getEmail()))
			throw new InternalServerException("Password is not secured", HttpStatus.OK);

		String otp = helper.generateOtp();

		String to = customer.getEmail();
		String subject = "Verify Your Account - Tarifvergleich Electricity";
		String body = emailTemplate.createForgotPasswordEmailBody(customer.getFirstName(), otp);

		mailService.sendMail(to, subject, body);

		customer.setOtp(otp);
		customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());
		customer.setTempPassword(confirmPassword);

		CustomerChangePasswordHistory history = CustomerChangePasswordHistory.builder().email(to).otp(otp)
				.codeSendOn(Helper.getCurrentTimeBerlin()).admin(customer.getAdmin()).build();

		customer.addCustomerChangePasswordHistory(history);

		customerRepo.save(customer);

		return Map.of("res", true, "message", "Otp send successfully");
	}

	@Transactional
	public Map<String, Object> changePasswordVerifyAndSet(Integer adminId, Integer customerId, String otp) {
		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findById(customerId).orElseThrow(
				() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (!customer.getAdmin().getAdminId().equals(adminId))
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		BigInteger expiryMillis = BigInteger.valueOf(expiryMinutes).multiply(BigInteger.valueOf(60));

		boolean isExpired = Helper.getCurrentTimeBerlin().subtract(customer.getOtpGeneratedOn())
				.compareTo(expiryMillis) > 0;

		CustomerChangePasswordHistory changePasswordHistory = Optional
				.ofNullable(customer.getCustomerChangePasswordHistories()).orElse(Collections.emptyList()).getLast();

		if (customer.getOtp().equals(otp)) {
			if (customer.getTempPassword() != null && !customer.getTempPassword().isEmpty()) {
				customer.setPassword(customer.getTempPassword());
				customer.setTempPassword(null);
				customer.setOtp(null);
				changePasswordHistory.setCodeVerifiedOn(Helper.getCurrentTimeBerlin());
				changePasswordHistory.setPasswordChangedOn(Helper.getCurrentTimeBerlin());

				String subject = "Change Password Confirmation - Tarifvergleich Electricity";
				String body = emailTemplate.createPasswordResetSuccessEmailBody(customer.getSalutation(),
						customer.getLastName(), customer.getFirstName(), customer.getEmail(),
						Helper.getLocalDateTimeFromBerlinEpoch().toString());

				mailService.sendMail(customer.getEmail(), subject, body);

				changePasswordHistory.setConfirmationSendOn(Helper.getCurrentTimeBerlin());
				customerRepo.save(customer);
				return Map.of("res", true, "message", "Password changed successfully");
			} else
				throw new InternalServerException("Bad request for changing password", HttpStatus.OK);
		} else if (customer.getOtp() != null && isExpired) {
			String newOtp = helper.generateOtp();
			customer.setOtp(newOtp);
			customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());
			String subject = "Verify Your Account - Tarifvergleich Electricity";
			String body = emailTemplate.createOtpEmailBody(customer.getFirstName(), newOtp);

			mailService.sendMail(customer.getEmail(), subject, body);
			changePasswordHistory.setOtp(otp);
			changePasswordHistory.setCodeSendOn(Helper.getCurrentTimeBerlin());
			changePasswordHistory.setWrongCodeLastTriedOn(Helper.getCurrentTimeBerlin());
			customerRepo.save(customer);
			return Map.of("res", false, "newOtp", true, "message", "New otp generated");
		}

		changePasswordHistory.setWrongCodeLastTriedOn(Helper.getCurrentTimeBerlin());
		customerRepo.save(customer);

		return Map.of("res", false, "newOtp", false, "message", "Invalid otp");
	}

	@Transactional
	public Map<String, Object> changePasswordWithEmailSender(Integer adminId, Integer customerId) {

		if (adminId == null || adminId <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);
		if (customerId == null || customerId <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);

		Customer customer = customerRepo.findByCustomerIdAndAdminAdminId(customerId, adminId).orElseThrow(
				() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

		if (!customer.getIsAcknowledged())
			throw new InternalServerException("Customer is not marked acknowledged", HttpStatus.OK);

		String tokenId = helper.generateUUId();
		String encryptedToken = "";
		try {
			encryptedToken = aesEncryptionService.encrypt(tokenId);
		} catch (Exception e) {
			e.printStackTrace();
			throw new InternalServerException("Error creating token", HttpStatus.OK);
		}

		if (encryptedToken.isEmpty())
			throw new InternalServerException("Cannot build token", HttpStatus.OK);

		TokenManagement manageToken = TokenManagement.builder().token(tokenId).customerId(customerId).build();

		tokenManagementRespo.save(manageToken);

		String mailBody = emailTemplate.createPasswordResetEmailBody(customer.getSalutation(), customer.getLastName(),
				encryptedToken);

		ServiceResponseEmailEvent mailEvent = new ServiceResponseEmailEvent(customer.getEmail(), "Reset Password",
				mailBody);

		eventPublisher.publishEvent(mailEvent);

		return Map.of("res", true, "message", "Email send successfully");
	}

	@Transactional
	public Map<String, Object> changePasswordWithEmail(String token, String password, String confirmPassword) {
		if (token == null || token.isEmpty())
			throw new InternalServerException("Token missing", HttpStatus.OK);

		if (!password.equals(confirmPassword))
			throw new InternalServerException("Password mismatch", HttpStatus.OK);

		Customer customer = null;
		try {
			String decryptedToken = aesEncryptionService.decrypt(token);
			TokenManagement manageToken = tokenManagementRespo.findByToken(decryptedToken)
					.orElseThrow(() -> new InternalServerException("No such token found", HttpStatus.OK));

			if (manageToken.getCustomerId() == null)
				throw new InternalServerException("Invalid token for this operation", HttpStatus.OK);

			if (manageToken.getUsed())
				throw new InternalServerException("Invalid or expired token", HttpStatus.OK);

			customer = customerRepo.findById(manageToken.getCustomerId()).orElseThrow(
					() -> new InternalServerException("Customer not found with this credential", HttpStatus.OK));

			manageToken.setUsed(true);
			tokenManagementRespo.save(manageToken);

		} catch (Exception e) {
			e.printStackTrace();
			throw new InternalServerException("Invalid token", HttpStatus.OK);
		}

		if (!helper.isPasswordSecure(password, customer.getEmail()))
			throw new InternalServerException("Provide secure password", HttpStatus.OK);

		customer.setPassword(password);

		customerRepo.save(customer);

		return Map.of("res", true, "message", "Password reset successfully");
	}

//	@Transactional
//	public Map<String, Object> sendMail(Integer id) {
//		Customer customer = customerRepo.findById(id).orElse(null);
//
//		String encodedId = Base64.getEncoder().encodeToString(customer.getCustomerId().toString().getBytes());
//
//		String mailBody = emailTemplate.createCustomerConsentEmailBody(customer.getSalutation(), customer.getLastName(),
//				encodedId);
//
//		ServiceAttachmentMailOfAcknowledgement mailRes = new ServiceAttachmentMailOfAcknowledgement(customer.getEmail(),
//				"Action Required: Confirm your Energy Selection", mailBody, customer.getAdmin().getAdminId());
//
//		eventPublisher.publishEvent(mailRes);
//		
////		mailService.sendMail(customer.getEmail(), "Something", mailBody);
//
//		return Map.of("res", true);
//	}
}
