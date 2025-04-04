package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.utl.dsm.redsolidaria.controller.ControllerRecuperacion;

@Path("/recuperacion")
public class RestRecuperacion {
    
    private final ControllerRecuperacion controller = new ControllerRecuperacion();
    private final Gson gson = new Gson();
    
    /**
     * Endpoint para solicitar recuperación de contraseña
     */
    @POST
    @Path("/solicitar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response solicitarRecuperacion(String jsonBody) {
        try {
            JsonObject json = gson.fromJson(jsonBody, JsonObject.class);
            String email = json.get("email").getAsString();
            
            String token = controller.generarTokenRecuperacion(email);
            
            if (token == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "No se encontró un usuario con ese correo electrónico");
                return Response.status(Response.Status.NOT_FOUND).entity(gson.toJson(response)).build();
            }
            
            // Aquí normalmente enviarías un correo electrónico con el enlace de recuperación
            // Como no estamos usando JavaMail, simplemente devolvemos el token en la respuesta
            // En un entorno de producción, deberías implementar el envío de correo
            
            String resetUrl = "http://localhost:8080/RedSolidaria/restablecerContrasenia.html?token=" + token;
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Se ha enviado un enlace de recuperación a tu correo electrónico");
            response.put("token", token); // Solo para pruebas, no incluir en producción
            response.put("resetUrl", resetUrl); // Solo para pruebas, no incluir en producción
            
            return Response.ok(gson.toJson(response)).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al procesar la solicitud: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(gson.toJson(response)).build();
        }
    }
    
    /**
     * Endpoint para validar un token de recuperación
     */
    @GET
    @Path("/validar-token")
    @Produces(MediaType.APPLICATION_JSON)
    public Response validarToken(@QueryParam("token") String token) {
        try {
            boolean esValido = controller.validarToken(token);
            String email = controller.obtenerEmailPorToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valido", esValido);
            if (esValido && email != null) {
                response.put("email", email);
            }
            
            return Response.ok(gson.toJson(response)).build();
        } catch (SQLException e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al validar el token: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(gson.toJson(response)).build();
        }
    }
    
    /**
     * Endpoint para restablecer la contraseña
     */
    @POST
    @Path("/restablecer")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response restablecerContrasenia(String jsonBody) {
        try {
            JsonObject json = gson.fromJson(jsonBody, JsonObject.class);
            String token = json.get("token").getAsString();
            String nuevaContrasenia = json.get("nuevaContrasenia").getAsString();
            
            boolean resultado = controller.restablecerContrasenia(token, nuevaContrasenia);
            
            if (!resultado) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Token inválido o expirado");
                return Response.status(Response.Status.BAD_REQUEST).entity(gson.toJson(response)).build();
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña restablecida correctamente");
            return Response.ok(gson.toJson(response)).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al restablecer la contraseña: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(gson.toJson(response)).build();
        }
    }
}