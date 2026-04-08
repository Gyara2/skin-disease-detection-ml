package com.example.Backend.DTO;

/* * DTO para la creación de un nuevo usuario.
 * Contiene los campos necesarios para registrar un nuevo usuario en el sistema.
 */
public class NewUserRequest {

    private String dni;
    private String nombre;
    private String apellido1;
    private String apellido2;
    private String password;
    private String email;

    private String rol;

    public String getDni() {
        return dni;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido1() {
        return apellido1;
    }

    public String getApellido2() {
        return apellido2;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRol() {
        return rol;
    }
}
