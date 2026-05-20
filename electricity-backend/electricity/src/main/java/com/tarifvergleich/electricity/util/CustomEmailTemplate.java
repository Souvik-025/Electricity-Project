package com.tarifvergleich.electricity.util;

import org.springframework.stereotype.Component;

@Component
public class CustomEmailTemplate {

	public String generateEmailHtml(String title, String subtitle, String emailContent) {
		String htmlTemplate = "<div class=\"mail-wrapper\">\n" + "  <!-- TOP HEADER -->\n"
				+ "  <div class=\"top-header\">\n" + "    <div class=\"logo-section\">\n"
				+ "      <img src=\"http://192.168.0.182:4200/images/logo/logo.png\" alt=\"logo\" class=\"logo\" />\n"
				+ "    </div>\n" + "\n" + "    <div class=\"profile-section\">\n"
				+ "      <img src=\"http://192.168.0.182:4200/images/electricity/Login.png\" alt=\"user\" class=\"profile-img\" />\n"
				+ "\n" + "      <span class=\"profile-name\">{{ emailData?.createdBy }}</span>\n" + "    </div>\n"
				+ "  </div>\n" + "\n" + "  <!-- ORANGE CONTACT -->\n" + "  <div class=\"contact-bar\">\n"
				+ "    <img src=\"http://192.168.0.182:4200/images/electricity/MM.png\" class=\"advisor-img\" />\n"
				+ "\n" + "    <div class=\"contact-info\">\n"
				+ "      <div class=\"advisor-name\">Ihr persönlicher Ansprechpartner</div>\n" + "\n"
				+ "      <div class=\"advisor-name\">Manuel Markovic</div>\n" + "\n"
				+ "      <div class=\"advisor-phone\">\n"
				+ "        <strong>08157 999 42-0 </strong> (Mo. - Sa. 8:00 - 20:00 Uhr)\n" + "      </div>\n"
				+ "    </div>\n" + "  </div>\n" + "\n" + "  <!-- TITLE -->\n" + "  <h1 class=\"main-title\">%s</h1>\n"
				+ "\n" + "  <!-- CONTENT -->\n" + "  <div class=\"mail-content\">\n" + "\n" + "    <!-- SUBTITLE -->\n"
				+ "    <h3 class=\"subtitle\">%s</h3>\n" + "\n" + "    <!-- TEXT AREA -->\n" + "    <div>%s</div>\n"
				+ "\n" + "  </div>\n" + "\n" + "  <!-- ORANGE TITLE -->\n"
				+ "  <div class=\"orange-title\">Ich bin für Sie da</div>\n" + "\n" + "  <!-- ADVISOR SECTION -->\n"
				+ "  <div class=\"advisor-section\">\n" + "    <div class=\"advisor-left\">\n"
				+ "      <div class=\"partner-photo-wrap\">\n"
				+ "        <img src=\"http://192.168.0.182:4200/images/electricity/MM.png\" alt=\"Familienbetrieb\" />\n"
				+ "      </div>\n" + "      <div class=\"partner-info\">\n"
				+ "        <div class=\"partner-name\">Manuel Markovic</div>\n"
				+ "        <div class=\"container-main-btn\">\n" + "          <button class=\"main-btn partner-btn\">\n"
				+ "            <span class=\"container-services\">\n"
				+ "              <img src=\"http://192.168.0.182:4200/images/electricity/Telefonhörer_Weiss.png\" class=\"icon-telephone\"\n"
				+ "                alt=\"telephone\" />\n" + "            </span>\n"
				+ "            <span class=\"btn-text\">08157 / 999 42-0</span>\n" + "          </button>\n"
				+ "          <button class=\"main-btn partner-btn\">\n"
				+ "            <span class=\"container-services\">\n"
				+ "              <img src=\"http://192.168.0.182:4200/images/electricity/Mail.png\" class=\"icon-email\" alt=\"email\" />\n"
				+ "            </span>\n" + "            <span class=\"btn-text\">mm@energiehandel.bayern</span>\n"
				+ "          </button>\n" + "        </div>\n" + "      </div>\n" + "    </div>\n" + "\n"
				+ "    <div class=\"advisor-right\">\n" + "      <p>Haben Sie noch Fragen zur Passwortänderung?</p>\n"
				+ "\n" + "      <p>\n" + "        Als Ihr persönlicher Ansprechpartner stehe ich Ihnen sehr gerne zur\n"
				+ "        Verfügung.\n" + "      </p>\n" + "\n" + "      <p>\n"
				+ "        Bitte nennen Sie bei der Beratung immer Ihre E-Mail-Adresse\n"
				+ "        <strong>m.mail@mustermann.de</strong>\n" + "      </p>\n" + "\n" + "      <p>\n"
				+ "        Sie erreichen mich von Montag bis Samstag zwischen\n"
				+ "        <strong>08:00 und 20:00 Uhr</strong>\n" + "        unter den nebenstehenden Kontaktdaten.\n"
				+ "      </p>\n" + "\n" + "      <p>Herzliche Grüße aus Bayern</p>\n" + "\n" + "      <p>\n"
				+ "        Manuel Markovic <br />\n" + "        Ihr persönlicher Kundenberater\n" + "      </p>\n"
				+ "    </div>\n" + "  </div>\n" + "\n" + "  <!-- FOOTER -->\n" + "  <div class=" + "\"footer-menu\""
				+ ">\n" + "    <span>Impressum</span>\n" + "    <span>Kontakt</span>\n"
				+ "    <span>Datenschutz</span>\n" + "    <span>AGB</span>\n" + "  </div>\n" + "\n"
				+ "  <div class=\"footer-bottom\">\n"
				+ "    © 2026 - Tarifvergleich.Bayern. Das Vergleichsportal. Hier können\n"
				+ "    Verbraucherinnen und Verbraucher kostenlos Tarife und Produkte in dem\n"
				+ "    Bereich Energie (Strom und Gas) vergleichen. Tarifvergleich.Bayern legt\n"
				+ "    größte Sorgfalt auf Vollständigkeit und Richtigkeit der dargestellten\n"
				+ "    Informationen, übernimmt aber keine Gewähr für diese oder die\n"
				+ "    Leistungsfähigkeit der Anbieter.\n" + "  </div>\n" + "</div>";

		return String.format(htmlTemplate, title, subtitle, emailContent);
	}
}
