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
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.FormParam;
import java.util.HashMap;
import org.utl.dsm.redsolidaria.model.Usuario;
import org.utl.dsm.redsolidaria.controller.ControllerUsuario;

import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.controller.ControllerUbicacion;

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
            Usuario usuario = gson.fromJson(usuarioJson, Usuario.class);
            usuarioController.modificarUsuario(usuario);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario modificado exitosamente");
            String jsonResponse = gson.toJson(response);

            return Response.ok(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al modificar usuario: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }

    // Obtener ID de usuario por correo electrónico
    @GET
    @Path("/obtener-id")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerIdUsuarioPorEmail(@QueryParam("email") String email) {
        try {
            // Validar que el correo electrónico no esté vacío
            if (email == null || email.isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST).entity("El correo electrónico no puede estar vacío.").build();
            }

            // Obtener el ID del usuario a partir del correo electrónico
            Integer idUsuario = usuarioController.obtenerIdUsuarioPorEmail(email);
            if (idUsuario != null) {
                // Crear un mapa para la respuesta
                Map<String, Integer> response = new HashMap<>();
                response.put("idUsuario", idUsuario);
                String jsonResponse = gson.toJson(response); // Convertir el mapa a JSON
                return Response.ok(jsonResponse).build(); // Devolver la respuesta JSON
            } else {
                return Response.status(Response.Status.NOT_FOUND).entity("Usuario no encontrado.").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener el ID de usuario: " + e.getMessage()).build();
        }
    }

    // En RestUsuario.java, añadir este método
    @POST
    @Path("/logout")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response logoutUsuario(@FormParam("email") @DefaultValue("") String email) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        try {
            controller.logoutUser(email);
            out = gson.toJson(new HashMap<String, String>() {
                {
                    put("result", "Logout exitoso, lastToken establecido a null");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            out = gson.toJson(new HashMap<String, String>() {
                {
                    put("result", "Error al hacer logout");
                }
            });
        }
        return Response.ok(out).build();
    }
    
    @GET
    @Path("/obtener-datos")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerDatosUsuario(@QueryParam("email") String email) {
        
        ControllerUbicacion ubicacionController = new ControllerUbicacion();
        try {
            Usuario usuario = usuarioController.obtenerDatosPorEmail(email);
            if (usuario != null) {
                // Obtener el estado a partir del ID de la ciudad
                int estado = ubicacionController.obtenerEstadoPorCiudad(usuario.getCiudad().getIdCiudad());
                usuario.getCiudad().setIdEstado(estado); // Asumiendo que Ciudad tiene un método setEstado
                return Response.ok(gson.toJson(usuario)).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).entity("Usuario no encontrado.").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener los datos del usuario: " + e.getMessage()).build();
        }
    }
    
    

}
