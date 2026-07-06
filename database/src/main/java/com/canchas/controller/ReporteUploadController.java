package com.canchas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteUploadController {

    private static final String UPLOAD_DIR = "uploads/reportes/";

    // Endpoint para subir evidencia de reporte/strike (PDF o Imagen)
    @PostMapping("/upload")
    public ResponseEntity<?> subirEvidencia(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            return ResponseEntity.badRequest().body("Únicamente se permiten archivos PDF o imágenes.");
        }

        try {
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String extension = obtenerExtension(file.getOriginalFilename());
            String nombreUnico = UUID.randomUUID().toString() + extension;
            Path rutaCompleta = Paths.get(UPLOAD_DIR + nombreUnico);

            Files.write(rutaCompleta, file.getBytes());

            String urlRelativa = "/uploads/reportes/" + nombreUnico;
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("url", urlRelativa);

            return ResponseEntity.ok(respuesta);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar el archivo: " + e.getMessage());
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return ".png";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf("."));
    }
}
