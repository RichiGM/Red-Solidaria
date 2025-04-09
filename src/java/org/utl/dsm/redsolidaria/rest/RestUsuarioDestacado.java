package org.utl.dsm.redsolidaria.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.controller.ControllerUsuarioDestacado;

@Path("/usuario")
public class RestUsuarioDestacado {

    private final ControllerUsuarioDestacado usuarioController = new ControllerUsuarioDestacado();
    private final Gson gson = new Gson(); // Crear una instancia de Gson


    @GET
    @Path("/destacados")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUsuariosDestacados(@HeaderParam("Authorization") String authHeader) {
        Gson gson = new Gson();
        try {
            // Extraer el token del header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new Exception("Token no proporcionado o inválido");
            }
            String token = authHeader.replace("Bearer ", "");

            List<Map<String, Object>> usuarios = usuarioController.getUsuariosDestacados(token);
            String jsonResponse = gson.toJson(usuarios);
            return Response.ok(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener usuarios destacados: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }


    @GET
    @Path("/obtener-datos-basicos")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerDatosBasicosUsuario(@QueryParam("id") int idUsuario) {
        try {
            Map<String, Object> usuario = usuarioController.obtenerDatosBasicosUsuario(idUsuario);
            if (usuario != null) {
                // Usar Gson para convertir el mapa a JSON
                String jsonResponse = gson.toJson(usuario);
                return Response.ok(jsonResponse).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Usuario no encontrado").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener datos del usuario: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/actualizar-descripcion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizarDescripcion(Map<String, Object> datos) {
        try {
            int idUsuario = (int) datos.get("idUsuario");
            String descripcion = (String) datos.get("descripcion");
            usuarioController.actualizarDescripcion(idUsuario, descripcion);
            return Response.ok("Descripción actualizada exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al actualizar descripción: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/actualizar-habilidades")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizarHabilidades(Map<String, Object> datos) {
        try {
            int idUsuario = (int) datos.get("idUsuario");
            List<Map<String, Integer>> habilidades = (List<Map<String, Integer>>) datos.get("habilidades");
            usuarioController.actualizarHabilidades(idUsuario, habilidades);
            return Response.ok("Habilidades actualizadas exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al actualizar habilidades: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/actualizar-telefono")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizarTelefono(Map<String, Object> datos) {
        try {
            int idUsuario = (int) datos.get("idUsuario");
            String telefono = (String) datos.get("telefono");
            usuarioController.actualizarTelefono(idUsuario, telefono);
            return Response.ok("Teléfono actualizado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al actualizar teléfono: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/bloquear")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response bloquearUsuario(Map<String, Integer> datos) {
        try {
            int idUsuarioBloquea = datos.get("idUsuarioBloquea");
            int idUsuarioBloqueado = datos.get("idUsuarioBloqueado");
            usuarioController.bloquearUsuario(idUsuarioBloquea, idUsuarioBloqueado);
            return Response.ok("Usuario bloqueado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al bloquear usuario: " + e.getMessage()).build();
        }
    }
}
