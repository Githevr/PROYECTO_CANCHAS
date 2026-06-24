package com.canchas.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void enviarCodigoConfirmacion(String destinatario, String nombre, String codigo) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            // True indica que usaremos soporte multipart/HTML y codificación UTF-8 limpia
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Confirma tu cuenta en Canchas Balón de Oro");

            // Plantilla HTML moderna, optimizada con semántica limpia para evitar filtros de SPAM
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang='es'>"
                    + "<head>"
                    + "<meta charset='UTF-8'>"
                    + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                    + "</head>"
                    + "<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a1628; color: #ffffff;'>"
                    + "<table width='100%' cellpadding='0' cellspacing='0' style='background-color: #0a1628; padding: 40px 20px;'>"
                    + "<tr>"
                    + "<td align='center'>"
                    + "<table width='100%' max-width='500' cellpadding='0' cellspacing='0' style='background-color: #112240; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #1e3a5f;'>"
                    + "<tr>"
                    + "<td align='center' style='padding-bottom: 20px;'>"
                    + "<h1 style='color: #39d353; font-size: 26px; margin: 0;'>Canchas Balón de Oro</h1>"
                    + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding-bottom: 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;'>"
                    + "<p style='margin: 0 0 15px;'>Hola <strong>" + nombre + "</strong>,</p>"
                    + "<p style='margin: 0;'>Gracias por unirte a nuestra comunidad. Para confirmar tu dirección de correo electrónico y habilitar tu cuenta, ingresa el siguiente código de 6 dígitos en la web:</p>"
                    + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td align='center' style='padding: 20px 0;'>"
                    + "<div style='background-color: #03080f; border: 2px dashed #39d353; border-radius: 12px; padding: 15px 30px; display: inline-block; font-size: 32px; font-weight: bold; color: #39d353; letter-spacing: 8px; font-family: monospace;'>"
                    + codigo
                    + "</div>"
                    + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding-top: 20px; border-top: 1px solid #1e3a5f; color: #64748b; font-size: 13px; text-align: center;'>"
                    + "<p style='margin: 0;'>Si no te has registrado en Canchas Balón de Oro, puedes ignorar este correo.</p>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</body>"
                    + "</html>";

            helper.setText(htmlContent, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el correo de confirmación. Verifica la configuración de tu cuenta SMTP.", e);
        }
    }
}
