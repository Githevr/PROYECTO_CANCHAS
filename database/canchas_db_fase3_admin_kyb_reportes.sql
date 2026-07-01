USE [canchas_db];
GO

-- =========================================================================
-- SCRIPT FASE 3: Admin, KYB y Reportes de Controversia
-- =========================================================================

-- =========================================================================
-- 1. INSERTAR USUARIO ADMINISTRADOR EN LA TABLA CLIENTE
-- Credenciales: correo = 'admin', password = 'admin'
-- =========================================================================
IF NOT EXISTS (SELECT 1 FROM cliente WHERE correo = 'admin')
BEGIN
    INSERT INTO cliente (nombre, apellido, telefono, correo, password, confirmado, rol, creditos)
    VALUES ('Super', 'Admin', '000000000', 'admin', 'admin', 1, 'ADMIN', 0.00);
    PRINT 'Usuario ADMIN insertado correctamente.';
END
GO

-- =========================================================================
-- 2. CAMPOS KYB EN LA TABLA complejo_deportivo
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'ruc')
BEGIN
    ALTER TABLE complejo_deportivo ADD ruc VARCHAR(11) NULL;
    PRINT 'Columna [ruc] agregada a complejo_deportivo.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'razon_social')
BEGIN
    ALTER TABLE complejo_deportivo ADD razon_social VARCHAR(255) NULL;
    PRINT 'Columna [razon_social] agregada a complejo_deportivo.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'estado_verificacion')
BEGIN
    ALTER TABLE complejo_deportivo ADD estado_verificacion VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION';
    PRINT 'Columna [estado_verificacion] agregada a complejo_deportivo.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'url_licencia')
BEGIN
    ALTER TABLE complejo_deportivo ADD url_licencia VARCHAR(255) NULL;
    PRINT 'Columna [url_licencia] agregada a complejo_deportivo.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'url_ficha_ruc')
BEGIN
    ALTER TABLE complejo_deportivo ADD url_ficha_ruc VARCHAR(255) NULL;
    PRINT 'Columna [url_ficha_ruc] agregada a complejo_deportivo.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('complejo_deportivo') AND name = 'url_dni_representante')
BEGIN
    ALTER TABLE complejo_deportivo ADD url_dni_representante VARCHAR(255) NULL;
    PRINT 'Columna [url_dni_representante] agregada a complejo_deportivo.';
END
GO

-- =========================================================================
-- 3. TABLA DE REPORTES DE CONTROVERSIA
-- Permite a jugadores reportar problemas con evidencia fotográfica
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reporte_reserva' AND xtype='U')
BEGIN
    CREATE TABLE reporte_reserva (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        reserva_id BIGINT NOT NULL,
        jugador_id BIGINT NOT NULL,
        motivo VARCHAR(1000) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',  -- PENDIENTE, RESUELTO_A_FAVOR, RESUELTO_RECHAZADO
        url_evidencia_1 VARCHAR(255) NOT NULL,             -- Evidencia 1 (obligatoria)
        url_evidencia_2 VARCHAR(255) NULL,                 -- Evidencia 2 (opcional)
        url_evidencia_3 VARCHAR(255) NULL,                 -- Evidencia 3 (opcional)
        resolucion_admin VARCHAR(1000) NULL,               -- Resolución del admin
        fecha_reporte DATETIME2 NOT NULL DEFAULT GETDATE(),
        fecha_resolucion DATETIME2 NULL,
        CONSTRAINT FK_reporte_reserva FOREIGN KEY (reserva_id) REFERENCES reserva(id) ON DELETE NO ACTION,
        CONSTRAINT FK_reporte_jugador FOREIGN KEY (jugador_id) REFERENCES cliente(id) ON DELETE NO ACTION
    );
    PRINT 'Tabla [reporte_reserva] creada con éxito.';
END
GO

PRINT '=========================================================================';
PRINT ' SCRIPT FASE 3 EJECUTADO CON ÉXITO.';
PRINT '=========================================================================';
GO
