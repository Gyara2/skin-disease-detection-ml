package com.example.Backend;

import com.example.Backend.Caso.*;
import com.example.Backend.DTO.*;
import com.example.Backend.Diccionario.*;
import com.example.Backend.Imagen.*;
import com.example.Backend.Prediccion.*;
import com.example.Backend.Rol.*;
import com.example.Backend.Security.*;
import com.example.Backend.Usuario.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controlador para manejar las solicitudes relacionadas con los usuarios.
 * Proporciona endpoints para crear nuevos usuarios y para iniciar sesión.
 */
@RestController
@RequestMapping("/api")
public class ApplicationController {

    // Inicimos los servicios necesarios para manejar las operaciones relacionadas con usuarios,
    // roles, casos clínicos, imágenes, diagnósticos y predicciones.
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private RolService rolService;
    @Autowired
    private CasoService casoService;
    @Autowired
    private ImagenService imagenService;
    @Autowired
    private PrediccionService prediccionService;

    private final BCryptPasswordEncoder encoder = SecurityConfig.passwordEncoder();

    /**
     * Endpoint para crear un nuevo usuario.
     *
     * @param usuariodto Objeto que contiene los datos del nuevo usuario.
     * @return ResponseEntity con el resultado de la operación.
     */
    @PostMapping("/NewUser")
    public ResponseEntity<String> newUser(@RequestBody NewUserRequest usuariodto) {
        Usuario usuario = new Usuario();

        // Asignamos los valores del DTO al nuevo usuario
        usuario.setDni(usuariodto.dni());
        usuario.setNombre(usuariodto.nombre());
        usuario.setApellido1(usuariodto.apellido1());
        usuario.setApellido2(usuariodto.apellido2());
        usuario.setEmail(usuariodto.email());
        usuario.setPassword(encoder.encode(usuariodto.password()));
        usuario.setEdad(usuariodto.edad());

        // Asignar el rol al usuario, en caso de recibir un rol no válido, se devuelve un error
        Rol rol = rolService.findByNombre(usuariodto.rol().toUpperCase());
        if (rol == null) {
            return ResponseEntity.status(400).body("Rol no válido: " + usuariodto.rol());
        }
        // Asignamos el rol al usuario, y establecemos las fechas de creación y actualización
        usuario.setRol(rol);
        usuario.setCreado(java.time.LocalDateTime.now());
        usuario.setActualizado(java.time.LocalDateTime.now());

        try {
            usuarioService.newUsuario(usuario);
            return ResponseEntity.ok("Usuario creado correctamente");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al crear el usuario: " + e.getMessage());
        }
    }

    /**
     * Endpoint para iniciar sesión.
     *
     * @param email    El correo electrónico del usuario que intenta iniciar sesión.
     * @param password La contraseña proporcionada por el usuario.
     * @return ResponseEntity con el resultado de la operación, incluyendo un token JWT si la autenticación es exitosa.
     */
    @GetMapping("/LogIn")
    public ResponseEntity<String> logIn(@RequestParam String email, @RequestParam String password) {
        try{
                // Buscamos al usuario por su correo
                Usuario usuario = usuarioService.findByEmail(email);
                if (usuario == null) {
                    return ResponseEntity.status(404).body("Usuario no encontrado con el correo: " + email);
                }else{
                    // Si el usuario existe, comprobamos que la contraseña sea correcta
                    if (!encoder.matches(password, usuario.getPassword())) {
                        return ResponseEntity.status(401).body("Contraseña incorrecta para el correo: " + email);
                    }
                }
                // Generamos un token JWT para el usuario autenticado,
                // incluyendo su rol como claim, y lo devolvemos en la respuesta
            String token = getToken(usuario);
            return ResponseEntity.ok("Inicio de sesión exitoso para el usuario con correo: " + email + ". Token: " + token);
        }catch(Exception e){
            return ResponseEntity.status(401).body("Error de autenticación: " + e.getMessage());
        }
    }

    /**
     * Genera un token JWT para el usuario autenticado, incluyendo su rol como claim.
     *
     * @param user El usuario para el cual se generará el token.
     * @return Un token JWT firmado con la información del usuario, o null en caso de error.
     */
    public String getToken(Usuario user){
       try{
           Map<String, Object> claims = new HashMap<>();

           // Aqui guardamos la informacion que guardamos en el token
           claims.put("rol", user.getRol().getNombre());
           return JwtUtil.generateToken(claims, user.getEmail());
       }catch(Exception e){
           System.out.println("Error al generar el token: " + e.getMessage());
           return null;
       }
    }

    /**
     * Endpoint para crear un nuevo caso clínico.
     * Usamos el correo de los usuarios, porque es un valor unico que es facil de recordar
     * (no es necesario recordar un UUID) y es el valor que se usa para iniciar sesión, por lo que es más intuitivo para los usuarios.
     * @param nuevoCaso Objeto que contiene los datos del nuevo caso clínico, incluyendo los correos del paciente y del especialista, y las imágenes asociadas.
     * @return ResponseEntity con el resultado de la operación.
     */
    // TODO: Modular el método dividiendo la lógica en métodos para cada "clase" de operación
    @PostMapping("/NewCaso")
    public ResponseEntity<String> newCase(@ModelAttribute NewCasoRequest nuevoCaso) {
        Caso caso = new Caso();
        Map<String, Double> resultadosMasAltos = new HashMap<>();

        // Validamos que los correos existen y corresponden a los roles requeridos (paciente y especialista)
        Usuario paciente = validarPaciente(nuevoCaso.emailPaciente());
        Usuario especialista = validarEspecialista(nuevoCaso.emailEspecialista());
        System.out.println("Paciente encontrado: " + paciente.getEmail());
        System.out.println("Especialista encontrado: " + especialista.getEmail());

        // Si ambos correos son válidos, procedemos a crear el caso clínico
        // asignando los valores correspondientes al paciente y al especialista
        caso.setPaciente(paciente);
        caso.setEspecialista(especialista);

        // Por defecto el estado del caso es "PENDIENTE" hasta que el especialista
        // revise las imágenes y confirme el diagnóstico
        caso.setEstado("PENDIENTE");
        caso.setCreado(java.time.LocalDateTime.now());
        caso.setActualizado(java.time.LocalDateTime.now());


        List<Imagen> imagenes = new ArrayList<>();
        if(nuevoCaso.imagenes() != null){
            try {
                imagenes = guardarImagenes(nuevoCaso.imagenes());
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Error al guardar las imágenes: " + e.getMessage());
            }
        }else{
            return ResponseEntity.status(400).body("No se proporcionaron imágenes para el caso clínico.");
        }

        List<Prediccion> predicciones = new ArrayList<>();
        for(Imagen img : imagenes){
            Prediccion prediccion = new Prediccion();
            Map<String, Double> resultado = getPrediccioneFromImagen(img);

            //A la respuesta solo mandamos los 3 mejores resultados, ordenados de mayor a menor,
            // y si hay empate se mantiene el orden original
            resultadosMasAltos = resultado.entrySet()
                    .stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed()) // Ordenamos de mayor a menor
                    .limit(3) // Seleccionamos solo con los 3 primeros
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue,
                            (e1, e2) -> e1,
                            LinkedHashMap::new // Usamos LinkedHashMap para mantener el orden de inserción
                    ));
            if(resultado == null){
                return ResponseEntity.status(500).body("Error al obtener el diagnóstico para la imagen: " + img.getNombreArchivo());
            }
            prediccion.setResultado(resultadosMasAltos);
            prediccion.setModeloVersion("1.0"); // Version hardcodeada
            prediccion.setImagen(img);
            prediccion.setCreado(java.time.LocalDateTime.now());
                try {
                    imagenService.saveImagen(img);
                    casoService.saveCaso(caso);
                    prediccionService.guardarPrediccion(prediccion);
                    predicciones.add(prediccion);

                } catch (Exception e) {
                    return ResponseEntity.status(500).body("Error al guardar la imagen o la predicción: " + e.getMessage());
                }
        }
        caso.setImagenes(imagenes);

        return ResponseEntity.ok("Caso clínico creado correctamente con el diagnóstico obtenido." + predicciones);
    }



    /** Método para guardar las imágenes proporcionadas en el caso clínico.
     *
     * @param archivos Lista de archivos de imagen a guardar.
     * @return Lista de objetos Imagen guardados en la base de datos, o una excepción en caso de error.
     * @throws Exception Si ocurre un error al guardar las imágenes.
     */
    public List<Imagen> guardarImagenes(List<MultipartFile> archivos) throws Exception {
        List<Imagen> imagenes = new ArrayList<>();
        for (MultipartFile file : archivos) {
            Imagen imagen = new Imagen();
            imagen.setNombreArchivo(file.getOriginalFilename());
            imagen.setDatosArchivo(file.getBytes());
            imagen.setUploadedAt(java.time.LocalDateTime.now());
            Imagen imagenGuardada = imagenService.saveImagen(imagen);
            imagenes.add(imagenGuardada);
        }
        return imagenes;
    }

    /**
     * Simula la respuesta de la IA mapeando los códigos técnicos
     * a nombres legibles para el usuario.
     */
    public Map<String, Double> obtenerPrediccionSimulada() {
        // Simulamos que 'respuesta' es el objeto que vendría de la IA
        // Hardcodeamos los valores típicos de una clasificación dermatológica
        return Map.of(
                "Melanoma", 0.05,
                "Nevus", 0.70,
                "QueratosisActinica", 0.02,
                "QueratosisSeborreica", 0.10,
                "CarcinomaBasocelular", 0.03,
                "CarcinomaEspinocelular", 0.01,
                "Dermatofibroma", 0.04,
                "VerrugaVulgar", 0.05
        );
    }

    /**
     * Endpoint para obtener el diagnóstico de un caso clínico a partir de las imágenes proporcionadas.
     *
     * @param img Lista de archivos de imagen asociados al caso clínico.
     * @return Mapa con las predicciones de diagnóstico para cada categoría de lesión cutánea, o null en caso de error.
     */
    public Map<String, Double> getPrediccioneFromImagen(Imagen img){
            try{
                // Convertimos la imagen a base 64
                String imagenBase64 = Base64.getEncoder().encodeToString(img.getDatosArchivo());

                // Creamos un cliente web para comunicarnos con el servicio externo de diagnóstico
                WebClient webClient = WebClient.create("http://localhost:5000/api");
                // Enviamos una solicitud POST al endpoint del servicio externo,
                // pasando las imágenes como parte del cuerpo de la solicitud
                ClasificacionDermatologica respuesta = webClient.post()
                        .uri("/predict")
                        .bodyValue(new RequestData(imagenBase64, img.getImagenId()))
                        .retrieve()
                        .bodyToMono(ClasificacionDermatologica.class)
                        .block();
                System.out.println("Respuesta recibida del servicio externo: " + respuesta);
                return Map.of(
                        "Melanoma", respuesta.mel(),
                        "Nevus", respuesta.nv(),
                        "QueratosisActinica", respuesta.akiec(),
                        "QueratosisSeborreica", respuesta.bkl(),
                        "CarcinomaBasocelular", respuesta.bcc(),
                        "CarcinomaEspinocelular", respuesta.vasc(),
                        "Dermatofibroma", respuesta.df()
                );
            }catch(Exception e){
                System.out.println("Error al obtener el diagnóstico: " + e.getMessage());
                return null;
            }

    }

    /** Endpoint para obtener todos los casos clínicos asociados a un paciente específico, identificado por su correo electrónico.
     *
     * @param correo El correo electrónico del paciente para el cual se desean obtener los casos clínicos.
     * @return ResponseEntity con la lista de casos clínicos asociados al paciente,
     * o un mensaje de error en caso de que el correo sea inválido o ocurra un error en el proceso.
     */
    @GetMapping("/GetCasoFromPaciente")
    // En este caso devolvemos "?" para no forzar una respuesta concreta en caso de recuperar una lista se devuelve la lista,
    // pero si ocurre un error se devuelve un mensaje de error (String)
    public ResponseEntity<?> getCaseFromPaciente(@RequestParam String correo) {
        List<CasoResponse> casos;
        if(correo == null || correo.isEmpty()){
            return ResponseEntity.status(400).body("El correo proporcionado es inválido: " + correo);
        }
        // Verificamos que el correo exista y que corresponda a un usuario "PACIENTE"
        Usuario user = validarPaciente(correo);

        try{
            casos = casoService.getAllCasosPaciente(correo);
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error al obtener los casos para el correo: " + correo + ". Detalles: " + e.getMessage());
        }
        return ResponseEntity.ok(casos);
    }

    /** Endpoint para obtener todos los casos clínicos pendientes asociados a un especialista específico, identificado por su correo electrónico.
     *
     * @param correo El correo electrónico del especialista para el cual se desean obtener los casos clínicos pendientes.
     * @return ResponseEntity con la lista de casos clínicos pendientes asociados al especialista,
     * o un mensaje de error en caso de que el correo sea inválido o ocurra un error en el proceso.
     */
    @GetMapping("/GetCasoFromEspecialista")
    // Al igual que en el endpoint anterior, devolvemos "?" para no forzar una respuesta concreta,
    // ya que en caso de error se devuelve un mensaje de error (String)
    public ResponseEntity<?> getCaseFromEspecialista(@RequestParam String correo) {
        if(correo == null || correo.isEmpty()){
            return ResponseEntity.status(400).body("El correo proporcionado es inválido: " + correo);
        }
        // Verificamos que el correo exista y que corresponda a un usuario "ESPECIALISTA"
        Usuario user = validarEspecialista(correo);

        List<CasoResponse> casos;
        // Recuperamos los casos pendientes
        try {
            casos = casoService.getAllCasosPendientes(correo);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener los casos pendientes para el correo: " + correo + ". Detalles: " + e.getMessage());
        }
        return ResponseEntity.ok(casos);
    }

    /** Método para validar que el correo proporcionado corresponda a un usuario con rol de paciente.
     *
     * @param email El correo electrónico del paciente a validar.
     * @return El objeto Usuario correspondiente al paciente si la validación es exitosa, o null en caso de error.
     */
    public Usuario validarPaciente(String email){
        // Validamos que el correo del paciente corresponda a un usuario con rol de paciente
        Usuario paciente = usuarioService.findByEmail(email);
        if(paciente == null){
            ResponseEntity.status(400).body("No se encontró un usuario con el correo proporcionado: " + email);
        }else{
            if(!paciente.getRol().getNombre().equals(Rol.TipoRol.PACIENTE)){
                ResponseEntity.status(400).body("El correo proporcionado no corresponde a un paciente: " + email);
            }
        }
        return paciente;
    }

    /** Método para validar que el correo proporcionado corresponda a un usuario con rol de especialista.
     *
     * @param email El correo electrónico del especialista a validar.
     * @return El objeto Usuario correspondiente al especialista si la validación es exitosa, o null en caso de error.
     */
    public Usuario validarEspecialista(String email){
        // Validamos que el correo del especialista corresponda a un usuario con rol de especialista
        Usuario especialista = usuarioService.findByEmail(email);
        if(especialista == null){
            ResponseEntity.status(400).body("No se encontró un usuario con el correo proporcionado: " + email);
        }else{
            if(!especialista.getRol().getNombre().equals(Rol.TipoRol.ESPECIALISTA)){
                ResponseEntity.status(400).body("El correo proporcionado no corresponde a un especialista: " + email);
            }
        }
        return especialista;
    }

    @GetMapping("/Roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            Map<String, Long> roles = rolService.getAllRoles();
            if(roles == null || roles.isEmpty()){
                return ResponseEntity.status(404).body("No se encontraron roles en la base de datos.");
            }
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener los roles: " + e.getMessage());
        }
    }

    @GetMapping("/ListadoUsuarios")
    public ResponseEntity<?> getAllUsuarios() {
        try {
            List<UsuarioResponse> usuarios = usuarioService.getAllUsuarios();
            if(usuarios == null || usuarios.isEmpty()){
                return ResponseEntity.status(404).body("No se encontraron usuarios en la base de datos.");
            }
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener los usuarios: " + e.getMessage());
        }
    }

}
