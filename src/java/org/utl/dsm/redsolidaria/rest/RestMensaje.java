package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.time.LocalDateTime;
import org.utl.dsm.redsolidaria.controller.ControllerMensaje;
import org.utl.dsm.redsolidaria.model.Mensaje;

import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.adapters.LocalDateTimeAdapter;

@Path("/mensaje")
public class RestMensaje {

    private final ControllerMensaje mensajeController = new ControllerMensaje();
    private final Gson gson = new GsonBuilder()
        .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
        .create();

    @POST
@Path("/enviar")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response enviarMensaje(String mensajeJson) {
    try {
        Mensaje mensaje = gson.fromJson(mensajeJson, Mensaje.class);
        mensaje.setFechaEnvio(LocalDateTime.now()); // Setear la fecha en el servidor
        int idMensaje = mensajeController.insertarMensaje(mensaje); // Método ajustado para devolver ID
        mensaje.setIdMensaje(idMensaje); // Asignar el ID generado
        return Response.status(Response.Status.CREATED)
                .entity(gson.toJson(mensaje)) // Devolver el mensaje completo
                .header("Access-Control-Allow-Origin", "*")
                .build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"Error al enviar mensaje: " + e.getMessage() + "\"}")
                .header("Access-Control-Allow-Origin", "*")
                .build();
    }
}

    @GET
    @Path("/conversacion/{idUsuario1}/{idUsuario2}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getConversacion(@PathParam("idUsuario1") int idUsuario1,
            @PathParam("idUsuario2") int idUsuario2) {
        try {
            List<Mensaje> mensajes = mensajeController.getConversacion(idUsuario1, idUsuario2);
            return Response.ok(gson.toJson(mensajes)).build(); // Serializar la lista de mensajes a JSON
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al obtener conversación: " + e.getMessage() + "\"}").build();
        }
    }

    @GET
    @Path("/chats/{idUsuario}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getChats(@PathParam("idUsuario") int idUsuario) {
        try {
            List<Map<String, Object>> chats = mensajeController.getChats(idUsuario);
            return Response.ok(gson.toJson(chats)).build(); // Serializar la lista de chats a JSON
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al obtener chats: " + e.getMessage() + "\"}").build();
        }
    }

    @POST
@Path("/marcar-leidos")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response marcarMensajesComoLeidos(String datosJson) {
    try {
        Map<String, Object> datos = gson.fromJson(datosJson, Map.class);
        Integer idUsuario = ((Number) datos.get("idUsuario")).intValue();
        Integer idRemitente = ((Number) datos.get("idRemitente")).intValue();

        if (idUsuario == null || idRemitente == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Faltan parámetros: idUsuario o idRemitente\"}")
                    .build();
        }

        mensajeController.marcarMensajesComoLeidos(idUsuario, idRemitente);
        return Response.ok("{\"message\":\"Mensajes marcados como leídos\"}")
                .header("Access-Control-Allow-Origin", "*")
                .build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"Error al marcar mensajes como leídos: " + e.getMessage() + "\"}")
                .header("Access-Control-Allow-Origin", "*")
                .build();
    }
}

    @POST
    @Path("/limpiar-conversacion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response limpiarConversacion(String datosJson) {
        try {
            Map<String, Integer> datos = gson.fromJson(datosJson, Map.class); // Convertir JSON a Map
            int idUsuario = datos.get("idUsuario");
            int idOtroUsuario = datos.get("idOtroUsuario");
            mensajeController.limpiarConversacion(idUsuario, idOtroUsuario);
            return Response.ok("{\"message\":\"Conversación limpiada exitosamente\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al limpiar conversación: " + e.getMessage() + "\"}").build();
        }
    }
}
