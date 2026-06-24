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
@RequestMapping("/api/canchas")
@CrossOrigin(origins = "*")
public class CanchaUploadController {

    private static final String UPLOAD_DIR = "uploads/canchas/";

    // Endpoint para subir una imagen de cancha
    @PostMapping("/upload")
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío.");
        }

        // Validar tipo de contenido (sólo imágenes)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Únicamente se permiten archivos de imagen.");
        }

        try {
            // Crear el directorio si no existe
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generar nombre de archivo único con UUID
            String extension = obtenerExtension(file.getOriginalFilename());
            String nombreUnico = UUID.randomUUID().toString() + extension;
            Path rutaCompleta = Paths.get(UPLOAD_DIR + nombreUnico);

            // Guardar el archivo en el disco
            Files.write(rutaCompleta, file.getBytes());

            // Retornar la URL relativa para acceder al archivo estático
            String urlRelativa = "/uploads/canchas/" + nombreUnico;
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("url", urlRelativa);

            return ResponseEntity.ok(respuesta);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar el archivo: " + e.getMessage());
        }
    }

    // Endpoint para eliminar una imagen físicamente del disco
    @DeleteMapping("/upload")
    public ResponseEntity<?> eliminarImagen(@RequestParam("url") String url) {
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body("La URL de la imagen es obligatoria.");
        }

        // Validar que la URL pertenezca al directorio de uploads para evitar Path Traversal
        if (!url.startsWith("/uploads/canchas/")) {
            return ResponseEntity.badRequest().body("Ruta de archivo no válida o no permitida.");
        }

        // Obtener el nombre del archivo de la URL
        String nombreArchivo = url.substring("/uploads/canchas/".length());
        
        // Evitar vulnerabilidad Path Traversal validando que no contenga caracteres sospechosos
        if (nombreArchivo.contains("..") || nombreArchivo.contains("/") || nombreArchivo.contains("\\")) {
            return ResponseEntity.badRequest().body("Nombre de archivo no válido.");
        }

        try {
            Path rutaArchivo = Paths.get(UPLOAD_DIR + nombreArchivo);
            File archivo = rutaArchivo.toFile();

            if (archivo.exists()) {
                boolean eliminado = archivo.delete();
                if (eliminado) {
                    return ResponseEntity.ok(Map.of("mensaje", "Imagen eliminada físicamente con éxito."));
                } else {
                    return ResponseEntity.internalServerError().body("No se pudo eliminar el archivo físico del servidor.");
                }
            } else {
                return ResponseEntity.status(404).body("La imagen no existe en el servidor.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar la eliminación: " + e.getMessage());
        }
    }

    // Método de soporte para extraer la extensión de un archivo
    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return ".jpg"; // Extensión por defecto si no se detecta
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf("."));
    }
}
