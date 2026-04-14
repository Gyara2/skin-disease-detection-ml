package com.example.Backend.Caso;

import com.example.Backend.DTO.CasoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

/** Servicio para la entidad Caso, que proporciona métodos para guardar casos
 *  y obtener casos pendientes por email de especialista o paciente.
 */
@Service
public class CasoService {
        private final CasoRepository casoRepository;
        public CasoService(CasoRepository casoRepository) {
            this.casoRepository = casoRepository;
        }
        public Caso saveCaso(Caso caso) {
            return casoRepository.save(caso);
        }
        public List<CasoResponse> getAllCasosPendientes(String correo){
            return casoRepository.getAllCasosByEspecialistaEmail(correo);
        }
        public List<CasoResponse> getAllCasosPaciente(String correo){
            return casoRepository.getAllCasosByPacienteEmail(correo);
        }
}
