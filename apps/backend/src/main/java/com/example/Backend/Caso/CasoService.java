package com.example.Backend.Caso;

import com.example.Backend.DTO.CasoDetalleImagenResponse;
import com.example.Backend.DTO.CasoDetalleDiagnosticoResponse;
import com.example.Backend.DTO.CasoDetallePrediccionResponse;
import com.example.Backend.DTO.CasoDetalleResponse;
import com.example.Backend.DTO.CasoDetalleUsuarioResponse;
import com.example.Backend.DTO.CasoDiagnosticoRequest;
import com.example.Backend.DTO.CasoListItemResponse;
import com.example.Backend.DTO.CasoUpsertRequest;
import com.example.Backend.DTO.RequestData;
import com.example.Backend.Diccionario.ClasificacionDermatologica;
import com.example.Backend.Imagen.Imagen;
import com.example.Backend.Imagen.ImagenRepository;
import com.example.Backend.Prediccion.Prediccion;
import com.example.Backend.Prediccion.PrediccionRepository;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Usuario.Usuario;
import com.example.Backend.Usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CasoService {
        private final CasoRepository casoRepository;
        private final UsuarioRepository usuarioRepository;
        private final ImagenRepository imagenRepository;
        private final PrediccionRepository prediccionRepository;
        private final String classifierApiUrl;

        public CasoService(
                CasoRepository casoRepository,
                UsuarioRepository usuarioRepository,
                ImagenRepository imagenRepository,
                PrediccionRepository prediccionRepository,
                @Value("${classifier.api.url:http://localhost:5000/api}") String classifierApiUrl
        ) {
            this.casoRepository = casoRepository;
            this.usuarioRepository = usuarioRepository;
            this.imagenRepository = imagenRepository;
            this.prediccionRepository = prediccionRepository;
            this.classifierApiUrl = classifierApiUrl;
        }

        @Transactional(readOnly = true)
        public List<CasoListItemResponse> getCasosForActor(String actorEmail, String actorRol) {
            if (actorEmail == null || actorEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("actorEmail es obligatorio.");
            }
            if (actorRol == null || actorRol.trim().isEmpty()) {
                throw new IllegalArgumentException("actorRol es obligatorio.");
            }

            Rol.TipoRol rol = Rol.TipoRol.valueOf(actorRol.trim().toUpperCase(Locale.ROOT));
            List<Caso> casos = switch (rol) {
                case ADMIN -> casoRepository.findAllWithRelationsOrderByCreadoDesc();
                case PACIENTE -> casoRepository.findAllByPacienteEmailWithRelationsOrderByCreadoDesc(actorEmail);
                case ESPECIALISTA -> casoRepository.findAllByEspecialistaEmailWithRelationsOrderByCreadoDesc(actorEmail);
            };

            return casos.stream()
                    .map(this::toCasoListItem)
                    .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public CasoDetalleResponse getCasoDetalle(Long casoId) {
            Caso caso = casoRepository.findByIdWithRelations(casoId)
                    .orElseThrow(() -> new NoSuchElementException("No se encontró el caso con id " + casoId));

            return toCasoDetalle(caso, true);
        }

        @Transactional(readOnly = true)
        public CasoDetalleResponse getCasoDetalle(Long casoId, String actorEmail, String actorRol) {
            if (actorEmail == null || actorEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("actorEmail es obligatorio.");
            }
            if (actorRol == null || actorRol.trim().isEmpty()) {
                throw new IllegalArgumentException("actorRol es obligatorio.");
            }

            Caso caso = casoRepository.findByIdWithRelations(casoId)
                    .orElseThrow(() -> new NoSuchElementException("No se encontró el caso con id " + casoId));

            Usuario actor = usuarioRepository.findByEmail(actorEmail.trim());
            if (actor == null || actor.getRol() == null || actor.getRol().getNombre() == null) {
                throw new NoSuchElementException("No se encontró un usuario válido para actorEmail.");
            }

            Rol.TipoRol rol = actor.getRol().getNombre();
            Rol.TipoRol rolSolicitado = Rol.TipoRol.valueOf(actorRol.trim().toUpperCase(Locale.ROOT));
            if (rol != rolSolicitado) {
                throw new IllegalArgumentException("actorRol no coincide con el rol real del usuario.");
            }

            boolean tieneAcceso = switch (rol) {
                case ADMIN -> true;
                case PACIENTE -> actorEmail.equalsIgnoreCase(caso.getPaciente().getEmail());
                case ESPECIALISTA -> actorEmail.equalsIgnoreCase(caso.getEspecialista().getEmail());
            };

            if (!tieneAcceso) {
                throw new SecurityException("No tienes permiso para consultar este caso.");
            }

            boolean incluirPredicciones = rol != Rol.TipoRol.PACIENTE;
            return toCasoDetalle(caso, incluirPredicciones);
        }

        @Transactional
        public CasoDetalleResponse upsertCaso(CasoUpsertRequest request) {
            validarRequest(request);

            Caso caso = resolveCasoForUpsert(request);
            List<String> imagenesInput = request.imagenes().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(item -> !item.isEmpty())
                    .toList();

            int order = 1;
            for (String imagenBase64 : imagenesInput) {
                Imagen imagen = new Imagen();
                imagen.setCaso(caso);
                imagen.setNombreArchivo(buildImageName(caso.getIdCaso(), order++));
                imagen.setDatosArchivo(decodeRawBase64(imagenBase64));
                imagen.setUploadedAt(LocalDateTime.now());

                Imagen savedImage = imagenRepository.save(imagen);

                Prediccion prediccion = new Prediccion();
                prediccion.setImagen(savedImage);
                prediccion.setModeloVersion("1.0");
                prediccion.setResultado(getPredictionTop3(savedImage));
                prediccion.setCreado(LocalDateTime.now());
                prediccionRepository.save(prediccion);
            }

            updateCasoEstadoForImageFlow(caso, imagenesInput.size());
            caso.setActualizado(LocalDateTime.now());
            casoRepository.save(caso);

            Caso refreshed = casoRepository.findByIdWithRelations(caso.getIdCaso())
                    .orElseThrow(() -> new NoSuchElementException("No se encontró el caso tras guardar."));
            return toCasoDetalle(refreshed, true);
        }

        @Transactional
        public CasoDetalleResponse registrarDiagnostico(Long casoId, CasoDiagnosticoRequest request) {
            if (request == null) {
                throw new IllegalArgumentException("La solicitud de diagnóstico es obligatoria.");
            }

            if (request.especialistaId() == null || request.especialistaId().trim().isEmpty()) {
                throw new IllegalArgumentException("El especialista es obligatorio.");
            }

            if (request.diagnostico() == null || request.diagnostico().trim().isEmpty()) {
                throw new IllegalArgumentException("El diagnóstico final es obligatorio.");
            }

            Caso caso = casoRepository.findByIdWithRelations(casoId)
                    .orElseThrow(() -> new NoSuchElementException("No se encontró el caso con id " + casoId));

            Long especialistaId = parseLongId(request.especialistaId(), "especialistaId");
            if (!Objects.equals(caso.getEspecialista().getId(), especialistaId)) {
                throw new IllegalArgumentException("Solo el especialista responsable puede emitir el diagnóstico final.");
            }

            LocalDateTime now = LocalDateTime.now();
            String nota = request.nota() == null ? null : request.nota().trim();

            caso.setDiagnosticoEspecialista(request.diagnostico().trim());
            caso.setNotaEspecialista(nota == null || nota.isBlank() ? null : nota);
            if (caso.getDiagnosticoCreado() == null) {
                caso.setDiagnosticoCreado(now);
            }
            caso.setDiagnosticoActualizado(now);
            caso.setEstado("completado");
            caso.setActualizado(now);
            casoRepository.save(caso);

            Caso refreshed = casoRepository.findByIdWithRelations(caso.getIdCaso())
                    .orElseThrow(() -> new NoSuchElementException("No se encontró el caso tras guardar diagnóstico."));
            return toCasoDetalle(refreshed, true);
        }

        private Caso resolveCasoForUpsert(CasoUpsertRequest request) {
            if (request.id() != null && !request.id().trim().isEmpty()) {
                Long caseId = parseLongId(request.id(), "id");
                return casoRepository.findById(caseId)
                        .orElseThrow(() -> new NoSuchElementException("No existe un caso con id " + request.id()));
            }

            Usuario paciente = usuarioRepository.findById(parseLongId(request.paciente(), "paciente"))
                    .orElseThrow(() -> new NoSuchElementException("No existe el paciente indicado."));
            Usuario especialista = usuarioRepository.findById(parseLongId(request.especialista(), "especialista"))
                    .orElseThrow(() -> new NoSuchElementException("No existe el especialista indicado."));

            if (paciente.getRol().getNombre() != Rol.TipoRol.PACIENTE) {
                throw new IllegalArgumentException("El usuario paciente no tiene rol PACIENTE.");
            }
            if (especialista.getRol().getNombre() != Rol.TipoRol.ESPECIALISTA) {
                throw new IllegalArgumentException("El usuario especialista no tiene rol ESPECIALISTA.");
            }

            Caso caso = new Caso();
            caso.setPaciente(paciente);
            caso.setEspecialista(especialista);
            caso.setEstado("pendiente");
            return casoRepository.save(caso);
        }

        private Map<String, Double> getPredictionTop3(Imagen imagen) {
            try {
                String imagenBase64 = Base64.getEncoder().encodeToString(imagen.getDatosArchivo());
                WebClient webClient = WebClient.create(classifierApiUrl);
                ClasificacionDermatologica result = webClient.post()
                        .uri("/predict")
                        .bodyValue(new RequestData(imagenBase64, imagen.getImagenId()))
                        .retrieve()
                        .bodyToMono(ClasificacionDermatologica.class)
                        .block();

                if (result == null) {
                    return Map.of();
                }

                Map<String, Double> fullResult = new LinkedHashMap<>();
                fullResult.put("Melanoma", safeDouble(result.mel()));
                fullResult.put("Nevus", safeDouble(result.nv()));
                fullResult.put("QueratosisActinica", safeDouble(result.akiec()));
                fullResult.put("QueratosisSeborreica", safeDouble(result.bkl()));
                fullResult.put("CarcinomaBasocelular", safeDouble(result.bcc()));
                fullResult.put("LesionVascular", safeDouble(result.vasc()));
                fullResult.put("Dermatofibroma", safeDouble(result.df()));

                return fullResult.entrySet()
                        .stream()
                        .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                        .limit(3)
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                Map.Entry::getValue,
                                (left, right) -> left,
                                LinkedHashMap::new
                        ));
            } catch (Exception ignored) {
                return Map.of();
            }
        }

        private Double safeDouble(Double value) {
            return value == null ? 0d : value;
        }

        private byte[] decodeRawBase64(String value) {
            String raw = value;
            int commaIdx = value.indexOf(',');
            if (commaIdx >= 0) {
                raw = value.substring(commaIdx + 1);
            }
            try {
                return Base64.getDecoder().decode(raw);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Alguna imagen no tiene un base64 válido.");
            }
        }

        private String buildImageName(Long casoId, int order) {
            return "caso_" + casoId + "_imagen_" + order + ".jpg";
        }

        private Long parseLongId(String value, String field) {
            try {
                return Long.valueOf(value.trim());
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("El campo '" + field + "' debe ser un id numérico.");
            }
        }

        private void validarRequest(CasoUpsertRequest request) {
            if (request == null) {
                throw new IllegalArgumentException("La solicitud es obligatoria.");
            }
            if (request.imagenes() == null || request.imagenes().isEmpty()) {
                throw new IllegalArgumentException("Debe informarse al menos una imagen.");
            }
            if (request.id() == null || request.id().trim().isEmpty()) {
                if (request.paciente() == null || request.paciente().trim().isEmpty()) {
                    throw new IllegalArgumentException("El paciente es obligatorio para crear un caso.");
                }
                if (request.especialista() == null || request.especialista().trim().isEmpty()) {
                    throw new IllegalArgumentException("El especialista es obligatorio para crear un caso.");
                }
            }
        }

        private CasoListItemResponse toCasoListItem(Caso caso) {
            String pacienteNombre = (caso.getPaciente().getNombre() + " " + caso.getPaciente().getApellido1() + " " + caso.getPaciente().getApellido2()).trim();
            String especialistaNombre = (caso.getEspecialista().getNombre() + " " + caso.getEspecialista().getApellido1() + " " + caso.getEspecialista().getApellido2()).trim();
            int totalImagenes = caso.getImagenes() == null ? 0 : caso.getImagenes().size();
            String estadoVisual = resolveEstadoVisual(caso.getEstado(), totalImagenes);
            int totalDiagnosticos = caso.getDiagnosticoEspecialista() == null || caso.getDiagnosticoEspecialista().isBlank() ? 0 : 1;

            return new CasoListItemResponse(
                    String.valueOf(caso.getIdCaso()),
                    String.valueOf(caso.getPaciente().getId()),
                    pacienteNombre,
                    String.valueOf(caso.getEspecialista().getId()),
                    especialistaNombre,
                    estadoVisual,
                    totalDiagnosticos,
                    totalImagenes,
                    caso.getCreado(),
                    caso.getActualizado()
            );
        }

        private CasoDetalleResponse toCasoDetalle(Caso caso, boolean incluirPredicciones) {
            List<CasoDetalleImagenResponse> imagenes = new ArrayList<>();
            if (caso.getImagenes() != null) {
                caso.getImagenes().stream()
                        .sorted(Comparator.comparing(Imagen::getUploadedAt).reversed())
                        .forEach(imagen -> imagenes.add(new CasoDetalleImagenResponse(
                                String.valueOf(imagen.getImagenId()),
                                imagen.getNombreArchivo(),
                                "image/jpeg",
                                imagen.getDatosArchivo() == null ? 0 : imagen.getDatosArchivo().length,
                                imagen.getUploadedAt(),
                                buildImageSrc(imagen.getDatosArchivo()),
                                toPredictionResponse(imagen.getPrediccion(), incluirPredicciones)
                        )));
            }
            String estadoVisual = resolveEstadoVisual(caso.getEstado(), imagenes.size());

            return new CasoDetalleResponse(
                    String.valueOf(caso.getIdCaso()),
                    estadoVisual,
                    caso.getCreado(),
                    caso.getActualizado(),
                    new CasoDetalleUsuarioResponse(
                            String.valueOf(caso.getPaciente().getId()),
                            caso.getPaciente().getNombre(),
                            caso.getPaciente().getApellido1(),
                            caso.getPaciente().getApellido2()
                    ),
                    new CasoDetalleUsuarioResponse(
                            String.valueOf(caso.getEspecialista().getId()),
                            caso.getEspecialista().getNombre(),
                            caso.getEspecialista().getApellido1(),
                            caso.getEspecialista().getApellido2()
                    ),
                    toDiagnosticoEspecialistaResponse(caso),
                    imagenes
            );
        }

        private CasoDetalleDiagnosticoResponse toDiagnosticoEspecialistaResponse(Caso caso) {
            if (caso.getDiagnosticoEspecialista() == null || caso.getDiagnosticoEspecialista().isBlank()) {
                return null;
            }

            String especialistaNombre = (
                    caso.getEspecialista().getNombre() + " "
                            + caso.getEspecialista().getApellido1() + " "
                            + caso.getEspecialista().getApellido2()
            ).trim();

            return new CasoDetalleDiagnosticoResponse(
                    caso.getDiagnosticoEspecialista(),
                    caso.getNotaEspecialista(),
                    caso.getDiagnosticoCreado(),
                    caso.getDiagnosticoActualizado(),
                    String.valueOf(caso.getEspecialista().getId()),
                    especialistaNombre
            );
        }

        private String buildImageSrc(byte[] rawBytes) {
            if (rawBytes == null || rawBytes.length == 0) {
                return null;
            }
            return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(rawBytes);
        }

        private CasoDetallePrediccionResponse toPredictionResponse(Prediccion prediccion, boolean incluirPredicciones) {
            if (!incluirPredicciones) {
                return null;
            }
            if (prediccion == null) {
                return null;
            }
            return new CasoDetallePrediccionResponse(
                    String.valueOf(prediccion.getPrediccionId()),
                    prediccion.getModeloVersion(),
                    prediccion.getResultado(),
                    prediccion.getCreado()
            );
        }

        private void updateCasoEstadoForImageFlow(Caso caso, int imagenesNuevas) {
            if ("completado".equalsIgnoreCase(caso.getEstado())) {
                return;
            }

            if (imagenesNuevas > 0) {
                caso.setEstado("en_proceso");
            } else if (caso.getEstado() == null || caso.getEstado().isBlank()) {
                caso.setEstado("pendiente");
            }
        }

        private String resolveEstadoVisual(String estadoPersistido, int totalImagenes) {
            if (estadoPersistido == null || estadoPersistido.isBlank()) {
                return totalImagenes > 0 ? "en_proceso" : "pendiente";
            }
            if ("pendiente".equalsIgnoreCase(estadoPersistido) && totalImagenes > 0) {
                return "en_proceso";
            }
            return estadoPersistido.toLowerCase(Locale.ROOT);
        }
}
