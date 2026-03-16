package com.taskcraft.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final boolean enabled;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public MailService(
            @Value("${app.mail.enabled:false}") boolean enabled,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.enabled = enabled;
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendMail(String to, String subject, String body) {
        if (!enabled) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Mail is enabled but JavaMailSender is not configured");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}

