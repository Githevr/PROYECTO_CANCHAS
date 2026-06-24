package com.canchas.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "canchas")
public class Canchas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String ubicacion;

    private Double precio;

    private String imagen;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cancha_imagenes", joinColumns = @JoinColumn(name = "cancha_id"))
    @Column(name = "imagen_url")
    private List<String> imagenes = new ArrayList<>();

    private Double rating;


    private String tipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "complejo_id")
    private ComplejoDeportivo complejo;

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public ComplejoDeportivo getComplejo() {
        return complejo;
    }

    public void setComplejo(ComplejoDeportivo complejo) {
        this.complejo = complejo;
    }

    public List<String> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<String> imagenes) {
        this.imagenes = imagenes;
        // Compatibilidad hacia atrás: Sincronizar el campo 'imagen' principal con la primera foto de la lista
        if (imagenes != null && !imagenes.isEmpty()) {
            this.imagen = imagenes.get(0);
        }
    }
}