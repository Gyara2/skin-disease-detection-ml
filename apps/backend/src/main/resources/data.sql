-- Insertar roles de prueba
INSERT IGNORE INTO rol (rol_id, nombre) VALUES (1, 'PACIENTE');
INSERT IGNORE INTO rol (rol_id, nombre) VALUES (2, 'ESPECIALISTA');
INSERT IGNORE INTO rol (rol_id, nombre) VALUES (3, 'ADMIN');



-- Insertar usuarios de prueba
-- Usamos REPLACE(UUID(), '-', '') para adaptarlo al formato que suele esperar Hibernate
INSERT IGNORE INTO usuario (usuario_id, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           1,
           '12345678A',
           'Diego',
           'García',
           'Pérez',
           25,
           'paciente@gmail.com',
           'contraseña',
           1, -- Rol de paciente
           NOW(),
           NOW()
       );

INSERT IGNORE INTO usuario (usuario_id, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           2,
           '87654321B',
           'Ana',
           'López',
           'Sanz',
           30,
           'especialista@gmail.com',
           'contraseña',
           2, -- Rol de especialista
           NOW(),
           NOW()
       );
INSERT IGNORE INTO usuario (usuario_id, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           2,
           '87651321B',
           'Pepe',
           'López',
           'Sanz',
           30,
           'admin@gmail.com',
           'contraseña',
           3, -- Rol de admin
           NOW(),
           NOW()
       );