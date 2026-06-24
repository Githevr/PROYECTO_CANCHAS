-- =========================================================================
-- SCRIPT DE ACTUALIZACIÓN INCREMENTAL - CANCHAS_DB (SQL SERVER)
-- =========================================================================
-- Ejecutar en SQL Server Management Studio (SSMS) o cliente SQL para actualizar
-- la estructura al modelo de Marketplace Multitenant con Créditos.
-- Este script es seguro y no altera los datos de prueba existentes.
-- =========================================================================

USE [canchas_db];
GO

PRINT 'Iniciando actualización de la estructura de base de datos...';
GO

-- =========================================================================
-- 1. MODIFICACIÓN DE LA TABLA cliente (Roles y Créditos)
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cliente') AND name = 'rol')
BEGIN
    ALTER TABLE cliente ADD rol VARCHAR(50) NOT NULL DEFAULT 'JUGADOR';
    PRINT 'Columna [rol] agregada a la tabla [cliente].';
END
ELSE
BEGIN
    PRINT 'La columna [rol] ya existe en [cliente].';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cliente') AND name = 'creditos')
BEGIN
    ALTER TABLE cliente ADD creditos DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    PRINT 'Columna [creditos] agregada a la tabla [cliente].';
END
ELSE
BEGIN
    PRINT 'La columna [creditos] ya existe en [cliente].';
END
GO

-- =========================================================================
-- 2. CREACIÓN DE LA TABLA complejo_deportivo
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='complejo_deportivo' AND xtype='U')
BEGIN
    CREATE TABLE complejo_deportivo (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        propietario_id BIGINT NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        ciudad VARCHAR(100) NOT NULL DEFAULT 'Trujillo',
        telefono_contacto VARCHAR(50) NOT NULL,
        yape_plin_info VARCHAR(255) NOT NULL, -- Información de pago directo (Ej: "Yape: 987654321 - Juan Perez")
        descripcion VARCHAR(MAX) NULL,
        beneficios VARCHAR(255) NULL,        -- Almacena servicios como: "Duchas, Estacionamiento, Cafetería"
        imagen_principal VARCHAR(255) NULL,
        rating FLOAT NULL DEFAULT 5.0,
        CONSTRAINT FK_complejo_propietario FOREIGN KEY (propietario_id) REFERENCES cliente(id) ON DELETE CASCADE
    );
    PRINT 'Tabla [complejo_deportivo] creada con éxito.';
END
ELSE
BEGIN
    PRINT 'La tabla [complejo_deportivo] ya existe.';
END
GO

-- =========================================================================
-- 3. MODIFICACIÓN DE LA TABLA canchas (Vincular a Complejo Deportivo)
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('canchas') AND name = 'complejo_id')
BEGIN
    ALTER TABLE canchas ADD complejo_id BIGINT NULL;
    ALTER TABLE canchas ADD CONSTRAINT FK_cancha_complejo FOREIGN KEY (complejo_id) REFERENCES complejo_deportivo(id) ON DELETE SET NULL;
    PRINT 'Columna [complejo_id] y restricción FK agregadas a la tabla [canchas].';
END
ELSE
BEGIN
    PRINT 'La columna [complejo_id] ya existe en [canchas].';
END
GO

-- =========================================================================
-- 4. MODIFICACIÓN DE LA TABLA reserva (Comisión y Precio Total)
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('reserva') AND name = 'comision_aplicada')
BEGIN
    ALTER TABLE reserva ADD comision_aplicada DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    PRINT 'Columna [comision_aplicada] agregada a la tabla [reserva].';
END
ELSE
BEGIN
    PRINT 'La columna [comision_aplicada] ya existe en [reserva].';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('reserva') AND name = 'precio_total')
BEGIN
    ALTER TABLE reserva ADD precio_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    PRINT 'Columna [precio_total] agregada a la tabla [reserva].';
END
ELSE
BEGIN
    PRINT 'La columna [precio_total] ya existe en [reserva].';
END
GO

-- =========================================================================
-- 5. CREACIÓN DE LA TABLA recarga_credito (Solicitudes de Saldo)
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='recarga_credito' AND xtype='U')
BEGIN
    CREATE TABLE recarga_credito (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        propietario_id BIGINT NOT NULL,
        monto_pagado DECIMAL(10, 2) NOT NULL,          -- Monto real en Soles (mínimo S/ 50.00)
        creditos_otorgados DECIMAL(10, 2) NOT NULL,    -- Créditos a cargar (monto + bonificaciones de promoción)
        metodo_pago VARCHAR(50) NOT NULL,              -- YAPE, PLIN, TRANSFERENCIA
        nro_operacion VARCHAR(100) NOT NULL,
        imagen_comprobante VARCHAR(255) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA
        fecha_solicitud DATETIME2 NOT NULL DEFAULT GETDATE(),
        fecha_aprobacion DATETIME2 NULL,
        CONSTRAINT FK_recarga_propietario FOREIGN KEY (propietario_id) REFERENCES cliente(id) ON DELETE CASCADE
    );
    PRINT 'Tabla [recarga_credito] creada con éxito.';
END
ELSE
BEGIN
    PRINT 'La tabla [recarga_credito] ya existe.';
END
GO

-- =========================================================================
-- 6. CREACIÓN DE LA TABLA historial_credito (Auditoría de Transacciones)
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='historial_credito' AND xtype='U')
BEGIN
    CREATE TABLE historial_credito (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        propietario_id BIGINT NOT NULL,
        tipo VARCHAR(50) NOT NULL,             -- RECARGA, DESCUENTO_RESERVA, DEVOLUCION
        monto DECIMAL(10, 2) NOT NULL,         -- Positivo (ingresos) o Negativo (comisiones)
        descripcion VARCHAR(255) NOT NULL,
        fecha DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_historial_propietario FOREIGN KEY (propietario_id) REFERENCES cliente(id) ON DELETE CASCADE
    );
    PRINT 'Tabla [historial_credito] creada con éxito.';
END
ELSE
BEGIN
    PRINT 'La tabla [historial_credito] ya existe.';
END
GO

PRINT '=========================================================================';
PRINT ' ACTUALIZACIÓN DE BASE DE DATOS FINALIZADA CON ÉXITO.';
PRINT '=========================================================================';
GO
