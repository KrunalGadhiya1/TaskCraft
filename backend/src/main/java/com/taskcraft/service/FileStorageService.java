package com.taskcraft.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootDir;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public StoredFile store(MultipartFile file) {
        try {
            Files.createDirectories(rootDir);

            String original = file.getOriginalFilename();
            String safeName = StringUtils.hasText(original) ? Paths.get(original).getFileName().toString() : "file";
            String ext = "";
            int dot = safeName.lastIndexOf('.');
            if (dot > -1 && dot < safeName.length() - 1) {
                ext = safeName.substring(dot);
                safeName = safeName.substring(0, dot);
            }
            String key = UUID.randomUUID().toString().replace("-", "");
            String storedName = safeName.replaceAll("[^a-zA-Z0-9-_]+", "_");
            if (storedName.length() > 50) storedName = storedName.substring(0, 50);
            String finalName = storedName + "_" + key + ext;

            Path target = rootDir.resolve(finalName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            StoredFile sf = new StoredFile();
            sf.setStoredFileName(finalName);
            sf.setOriginalFileName(original);
            sf.setContentType(file.getContentType());
            sf.setSizeBytes(file.getSize());
            return sf;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store file");
        }
    }

    public static class StoredFile {
        private String storedFileName;
        private String originalFileName;
        private String contentType;
        private long sizeBytes;

        public String getStoredFileName() {
            return storedFileName;
        }

        public void setStoredFileName(String storedFileName) {
            this.storedFileName = storedFileName;
        }

        public String getOriginalFileName() {
            return originalFileName;
        }

        public void setOriginalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public long getSizeBytes() {
            return sizeBytes;
        }

        public void setSizeBytes(long sizeBytes) {
            this.sizeBytes = sizeBytes;
        }
    }
}

