package com.canchas.config;

/**
 * Patrón Singleton (Thread-safe) para la configuración centralizada de la plataforma.
 * Almacena las variables de negocio como el porcentaje de comisión y el tiempo de tolerancia.
 */
public class ConfiguracionPlataforma {

    private static volatile ConfiguracionPlataforma instancia;

    // Constantes de negocio
    private final double comisionPorcentaje; // e.g. 0.08 para 8%
    private final int toleranciaMinutos;       // e.g. 15 minutos

    private ConfiguracionPlataforma() {
        // Inicialización de las reglas de negocio
        this.comisionPorcentaje = 0.08; 
        this.toleranciaMinutos = 15;
    }

    public static ConfiguracionPlataforma getInstancia() {
        if (instancia == null) {
            synchronized (ConfiguracionPlataforma.class) {
                if (instancia == null) {
                    instancia = new ConfiguracionPlataforma();
                }
            }
        }
        return instancia;
    }

    public double getComisionPorcentaje() {
        return comisionPorcentaje;
    }

    public int getToleranciaMinutos() {
        return toleranciaMinutos;
    }
}
