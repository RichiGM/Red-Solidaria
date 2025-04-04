package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.controller.ControllerMensaje;
import org.utl.dsm.redsolidaria.model.Mensaje;

@Path("/mensaje")
public class RestMensaje {

    private final ControllerMensaje mensajeController = new ControllerMensaje();

    @POST
    @Path("/enviar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response enviarMensaje(Mensaje mensaje) {
        try {
            mensajeController.enviarMensaje(mensaje);
            return Response.status(Response.Status.CREATED).entity("Mensaje enviado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al enviar mensaje: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/conversacion/{idUsuario1}/{idUsuario2}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getConversacion(@PathParam("idUsuario1") int idUsuario1, 
                                   @PathParam("idUsuario2") int idUsuario2) {
        try {
            List<Mensaje> mensajes = mensajeController.getConversacion(idUsuario1, idUsuario2);
            return Response.ok(mensajes).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener conversación: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/chats/{idUsuario}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getChats(@PathParam("idUsuario") int idUsuario) {
        try {
            List<Map<String, Object>> chats = mensajeController.getChats(idUsuario);
            return Response.ok(chats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener chats: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/marcar-leidos")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response marcarMensajesComoLeidos(Map<String, Integer> datos) {
        try {
            int idUsuario = datos.get("idUsuario");
            int idRemitente = datos.get("idRemitente");
            mensajeController.marcarMensajesComoLeidos(idUsuario, idRemitente);
            return Response.ok("Mensajes marcados como leídos").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al marcar mensajes como leídos: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/limpiar-conversacion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response limpiarConversacion(Map<String, Integer> datos) {
        try {
            int idUsuario = datos.get("idUsuario");
            int idOtroUsuario = datos.get("idOtroUsuario");
            mensajeController.limpiarConversacion(idUsuario, idOtroUsuario);
            return Response.ok("Conversación limpiada exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al limpiar conversación: " + e.getMessage()).build();
        }
    }
}