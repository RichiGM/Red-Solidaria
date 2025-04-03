package org.utl.dsm.redsolidaria.rest;

import jakarta.websocket.server.PathParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import org.utl.dsm.redsolidaria.model.Usuario;
import org.utl.dsm.redsolidaria.controller.ControllerUsuario;

import java.util.List;

@Path("/usuario")
public class RestUsuario {

    private final ControllerUsuario usuarioController = new ControllerUsuario();
    private final Gson gson = new Gson(); // Instancia de Gson

    // Verificar si el correo electrónico ya está registrado
    @GET
    @Path("/verificar-email")
    @Produces(MediaType.APPLICATION_JSON)
    public Response verificarEmail(@QueryParam("email") String email) {
        try {
            boolean exists = usuarioController.emailExists(email);
            if (exists) {
                return Response.status(Response.Status.CONFLICT).entity("El correo electrónico ya está registrado.").build();
            } else {
                return Response.ok("El correo electrónico está disponible.").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al verificar el correo electrónico: " + e.getMessage()).build();
        }
    }

    // Crear un nuevo usuario (Registro)
    @POST
    @Path("/registrar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response registrarUsuario(String usuarioJson) {
        try {
            Usuario usuario = gson.fromJson(usuarioJson, Usuario.class); // Convertir JSON a objeto Usuario
            usuarioController.registrarUsuario(usuario);
            return Response.status(Response.Status.CREATED).entity("Usuario registrado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al registrar usuario: " + e.getMessage()).build();
        }
    }
    
    // Modificar un usuario
@PUT
@Path("/modificar")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response modificarUsuario(String usuarioJson) {
    try {
        Usuario usuario = gson.fromJson(usuarioJson, Usuario.class); // Convertir JSON a objeto Usuario
        usuarioController.modificarUsuario(usuario);
        return Response.ok("Usuario modificado exitosamente").build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al modificar usuario: " + e.getMessage()).build();
    }
}
    
    
}