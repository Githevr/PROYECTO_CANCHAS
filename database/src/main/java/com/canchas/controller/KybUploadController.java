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
@RequestMapping("/api/kyb")
@CrossOrigin(origins = "*")
public class KybUploadController {

    private static final String UPLOAD_DIR = "uploads/kyb/";

    // Endpoint para subir un documento KYB (PDF o Imagen)
    @PostMapping("/upload")
    public ResponseEntity<?> subirDocumento(@RequestParam("file") MultipartFile file) {
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

            String urlRelativa = "/uploads/kyb/" + nombreUnico;
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("url", urlRelativa);

            return ResponseEntity.ok(respuesta);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar el archivo: " + e.getMessage());
        }
    }

    // Endpoint para eliminar un documento KYB físicamente del disco
    @DeleteMapping("/upload")
    public ResponseEntity<?> eliminarDocumento(@RequestParam("url") String url) {
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body("La URL del documento es obligatoria.");
        }

        if (!url.startsWith("/uploads/kyb/")) {
            return ResponseEntity.badRequest().body("Ruta de archivo no válida o no permitida.");
        }

        String nombreArchivo = url.substring("/uploads/kyb/".length());
        
        if (nombreArchivo.contains("..") || nombreArchivo.contains("/") || nombreArchivo.contains("\\")) {
            return ResponseEntity.badRequest().body("Nombre de archivo no válido.");
        }

        try {
            Path rutaArchivo = Paths.get(UPLOAD_DIR + nombreArchivo);
            File archivo = rutaArchivo.toFile();

            if (archivo.exists()) {
                boolean eliminado = archivo.delete();
                if (eliminado) {
                    return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado con éxito."));
                } else {
                    return ResponseEntity.internalServerError().body("No se pudo eliminar el archivo.");
                }
            } else {
                return ResponseEntity.status(404).body("El documento no existe en el servidor.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar la eliminación: " + e.getMessage());
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return ".pdf";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf("."));
    }
}
