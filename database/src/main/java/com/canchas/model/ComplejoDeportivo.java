package com.canchas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complejo_deportivo")
public class ComplejoDeportivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "propietario_id", nullable = false)
    private Cliente propietario;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String ciudad;

    @Column(name = "telefono_contacto", nullable = false)
    private String telefonoContacto;

    @Column(name = "yape_plin_info", nullable = false)
    private String yapePlinInfo;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String descripcion;

    private String beneficios; // Guardado como comas separadas (e.g. "Duchas,Estacionamiento,Cafetería")

    @Column(name = "imagen_principal")
    private String imagenPrincipal;

    private Double rating;

    // =========================================================================
    // CAMPOS KYB (Know Your Business) - Verificación Legal del Complejo
    // =========================================================================

    // RUC del negocio (11 dígitos, Persona Jurídica o Natural con Negocio)
    @Column(length = 11)
    private String ruc;

    // Razón social registrada en SUNAT
    @Column(name = "razon_social")
    private String razonSocial;

    // Estado de verificación del complejo: PENDING_VERIFICATION, APPROVED, REJECTED
    @Column(name = "estado_verificacion", nullable = false, length = 50)
    private String estadoVerificacion;

    // URL del archivo PDF/Imagen de la Licencia de Funcionamiento Municipal
    @Column(name = "url_licencia")
    private String urlLicencia;

    // URL del archivo PDF/Imagen de la Ficha RUC (SUNAT)
    @Column(name = "url_ficha_ruc")
    private String urlFichaRuc;

    // URL de la foto/PDF del DNI o Carnet de Extranjería del Representante Legal
    @Column(name = "url_dni_representante")
    private String urlDniRepresentante;

    public ComplejoDeportivo() {
        this.rating = 5.0;
        this.ciudad = "Trujillo";
        this.estadoVerificacion = "PENDING_VERIFICATION"; // Estado inicial: pendiente de revisión
    }

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getPropietario() {
        return propietario;
    }

    public void setPropietario(Cliente propietario) {
        this.propietario = propietario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getTelefonoContacto() {
        return telefonoContacto;
    }

    public void setTelefonoContacto(String telefonoContacto) {
        this.telefonoContacto = telefonoContacto;
    }

    public String getYapePlinInfo() {
        return yapePlinInfo;
    }

    public void setYapePlinInfo(String yapePlinInfo) {
        this.yapePlinInfo = yapePlinInfo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getBeneficios() {
        return beneficios;
    }

    public void setBeneficios(String beneficios) {
        this.beneficios = beneficios;
    }

    public String getImagenPrincipal() {
        return imagenPrincipal;
    }

    public void setImagenPrincipal(String imagenPrincipal) {
        this.imagenPrincipal = imagenPrincipal;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    // =========================================================================
    // GETTERS Y SETTERS KYB
    // =========================================================================

    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getEstadoVerificacion() { return estadoVerificacion; }
    public void setEstadoVerificacion(String estadoVerificacion) { this.estadoVerificacion = estadoVerificacion; }

    public String getUrlLicencia() { return urlLicencia; }
    public void setUrlLicencia(String urlLicencia) { this.urlLicencia = urlLicencia; }

    public String getUrlFichaRuc() { return urlFichaRuc; }
    public void setUrlFichaRuc(String urlFichaRuc) { this.urlFichaRuc = urlFichaRuc; }

    public String getUrlDniRepresentante() { return urlDniRepresentante; }
    public void setUrlDniRepresentante(String urlDniRepresentante) { this.urlDniRepresentante = urlDniRepresentante; }
}
