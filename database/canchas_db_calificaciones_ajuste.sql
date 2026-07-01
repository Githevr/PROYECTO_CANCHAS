-- =========================================================================
-- Script de Ajuste: Calificación Única por Cancha
-- =========================================================================
-- Descripción: Este script migra la tabla 'calificacion' para soportar 
-- la nueva regla de negocio que permite a un cliente calificar una 
-- cancha solo una vez.
-- =========================================================================

-- 1. Agregar la nueva columna 'cancha_id' a la tabla 'calificacion'.
-- Se permite temporalmente valores nulos para poder poblarla.
ALTER TABLE calificacion ADD cancha_id BIGINT NULL;
GO

-- 2. Poblar la columna 'cancha_id' usando la relación existente con 'reserva'.
UPDATE c
SET c.cancha_id = r.cancha_id
FROM calificacion c
INNER JOIN reserva r ON c.reserva_id = r.id;
GO

-- 3. Modificar la columna 'cancha_id' para que sea NOT NULL.
ALTER TABLE calificacion ALTER COLUMN cancha_id BIGINT NOT NULL;
GO

-- 4. Agregar la Foreign Key hacia la tabla 'canchas'.
ALTER TABLE calificacion 
ADD CONSTRAINT FK_calificacion_cancha 
FOREIGN KEY (cancha_id) REFERENCES canchas(id);
GO

-- 5. Eliminar calificaciones duplicadas si existen, conservando solo la más reciente 
--    (o la más antigua, dependiendo del ID). Aquí conservamos el MIN(id) por cliente y cancha.
WITH CTE AS (
    SELECT 
        id,
        ROW_NUMBER() OVER(PARTITION BY cliente_id, cancha_id ORDER BY id ASC) as fila
    FROM calificacion
)
DELETE FROM calificacion
WHERE id IN (SELECT id FROM CTE WHERE fila > 1);
GO

-- 6. Agregar la restricción única (Unique Constraint) para evitar futuros duplicados.
ALTER TABLE calificacion 
ADD CONSTRAINT UK_calificacion_cliente_cancha 
UNIQUE (cliente_id, cancha_id);
GO

PRINT 'El esquema de calificaciones se ha actualizado con éxito.';
