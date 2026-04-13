package com.codeshield.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
public class EmailService {

    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(toEmail, resetLink);
        } else {
            log.info("=== PASSWORD RESET ===");
            log.info("To: {}", toEmail);
            log.info("Link: {}", resetLink);
            log.info("======================");
        }
    }

    private void sendViaResend(String toEmail, String resetLink) {
        try {
            String json = """
                {
                    "from": "CodeShield AI <noreply@revidex.vercel.app>",
                    "to": ["%s"],
                    "subject": "Reset your CodeShield AI password",
                    "html": "<div style='font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#0F172A;border-radius:16px;'><div style='text-align:center;margin-bottom:32px;'><div style='display:inline-block;width:40px;height:40px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);border-radius:12px;line-height:40px;color:white;font-weight:bold;font-size:18px;'>C</div><span style='margin-left:8px;font-size:18px;font-weight:700;color:#F8FAFC;'>CodeShield AI</span></div><h2 style='color:#F8FAFC;font-size:20px;text-align:center;margin-bottom:16px;'>Reset your password</h2><p style='color:#94A3B8;font-size:14px;text-align:center;line-height:1.6;margin-bottom:32px;'>Click the button below to set a new password. This link expires in 15 minutes.</p><div style='text-align:center;margin-bottom:32px;'><a href='%s' style='display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#3B82F6,#6366F1);color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;'>Reset Password</a></div><p style='color:#64748B;font-size:12px;text-align:center;'>If you didn't request this, you can safely ignore this email.</p></div>"
                }
                """.formatted(toEmail, resetLink);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("Password reset email sent to {}", toEmail);
            } else {
                log.warn("Resend API error {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Resend: {}", e.getMessage());
        }
    }
}
