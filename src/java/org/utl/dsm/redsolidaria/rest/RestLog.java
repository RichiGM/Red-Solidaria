package org.utl.dsm.redsolidaria.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.JsonObject;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.codec.digest.DigestUtils;
import org.utl.dsm.redsolidaria.controller.ControllerLog;

@Path("login")
public class RestLog {

    private ControllerLog controllerLog = new ControllerLog();

    @Path("validate")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response validateUser(String jsonString) {
        JsonObject json = new Gson().fromJson(jsonString, JsonObject.class);
        String email = json.get("email").getAsString();
        String password = json.get("password").getAsString();
        String passwordHash = DigestUtils.sha256Hex(password);

        boolean isValid = controllerLog.validateUser(email, passwordHash);

        JsonObject response = new JsonObject();
        response.addProperty("success", isValid);

        return Response.ok(response.toString()).build();
    }

    @Path("check")
    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public Response checkingUser(@QueryParam("email") @DefaultValue("") String email) throws Exception {
        String result = controllerLog.checkUsers(email);
        Gson gson = new Gson(); // Crear una instancia de Gson
        Map<String, Object> jsonResponse = new HashMap<>(); // Usar un Map para la respuesta

        if (result == null || result.isEmpty()) {
            jsonResponse.put("error", "No se encontró un usuario");
        } else {
            // Convertir el resultado JSON a un Map
            Map<String, String> userMap = gson.fromJson(result, Map.class);

            // Agregar las propiedades al jsonResponse
            jsonResponse.put("token", userMap.get("token"));
            jsonResponse.put("username", userMap.get("username"));
            jsonResponse.put("email", userMap.get("email"));
        }

        // Convertir el Map a JSON y devolver la respuesta
        return Response.ok(gson.toJson(jsonResponse)).build();
    }

    @Path("logout")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response logoutUsuario(@FormParam("email") @DefaultValue("") String email) {
        try {
            controllerLog.logoutUser(email);
            return Response.ok("{\"result\":\"Logout exitoso, lastToken establecido a null\"}").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"result\":\"Error al hacer logout\"}").build();
        }
    }
}
