package com.example.Backend.Imagen;

import org.springframework.stereotype.Service;

/** * Servicio para gestionar las operaciones relacionadas con la entidad Imagen, como guardar imágenes en la base de datos.
 * Este servicio utiliza el repositorio ImagenRepository para realizar las operaciones de persistencia.
 */
@Service
public class ImagenService {
        private final ImagenRepository imagenRepository;

        public ImagenService(ImagenRepository imagenRepository) {
            this.imagenRepository = imagenRepository;
        }

        public Imagen saveImagen(Imagen imagen) {
            return imagenRepository.save(imagen);
        }
}
