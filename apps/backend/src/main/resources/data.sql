-- Insertar roles de prueba
INSERT IGNORE INTO rol (rolId, nombre) VALUES (1, 'PACIENTE');
INSERT IGNORE INTO rol (rolId, nombre) VALUES (2, 'ESPECIALISTA');
INSERT IGNORE INTO rol (rolId, nombre) VALUES (3, 'ADMIN');



-- Insertar usuarios de prueba
INSERT IGNORE INTO usuario (usuarioID, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           -- Tienes que generar un UUID manual para las pruebas
           1,
           '1234567A',
           'Diego',
           'García',
           'Pérez',
           25,
           'paciente@gmail.com',
           'contraseña',
           1,
           NOW(),
           NOW()
       );
INSERT IGNORE INTO usuario (usuarioID, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           -- Tienes que generar un UUID manual para las pruebas
           2,
           '12345678A',
           'Pepe',
           'García',
           'Pérez',
           25,
           'especialista@gmail.com',
           'contraseña',
           2,
           NOW(),
           NOW()
       );
INSERT IGNORE INTO usuario (usuarioID, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES (
           -- Tienes que generar un UUID manual para las pruebas
           3,
           '1245678A',
           'Maria',
           'García',
           'Pérez',
           25,
           'admin@gmail.com',
           'contraseña',
           3,
           NOW(),
           NOW()
       );