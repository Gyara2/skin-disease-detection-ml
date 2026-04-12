package com.example.Backend.Diagnostico;

import org.springframework.stereotype.Service;


@Service
public class DiagnosticoService {

        private final DiagnosticoRepository diagnosticoRepository;

        public DiagnosticoService(DiagnosticoRepository diagnosticoRepository) {
            this.diagnosticoRepository = diagnosticoRepository;
        }

        public Diagnostico saveDiagnostico(Diagnostico diagnostico) {
            return diagnosticoRepository.save(diagnostico);
        }
}
