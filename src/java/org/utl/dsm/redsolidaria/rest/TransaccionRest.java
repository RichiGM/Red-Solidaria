package org.utl.dsm.redsolidaria.rest;

import org.utl.dsm.redsolidaria.model.Transaccion;
import org.utl.dsm.redsolidaria.controller.TransaccionController;
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
import java.util.List;

@Path("/transaccion")
public class TransaccionRest {

    private final TransaccionController transaccionController = new TransaccionController();

    // Crear una nueva transacción
    @POST
    @Path("/crear")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crearTransaccion(Transaccion transaccion) {
        try {
            transaccionController.crearTransaccion(transaccion);
            return Response.status(Response.Status.CREATED).entity("Transacción creada exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al crear transacción: " + e.getMessage()).build();
        }
    }

    // Obtener todas las transacciones de un usuario
    @GET
    @Path("/usuario/{idUsuario}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTransaccionesPorUsuario(@PathParam("idUsuario") int idUsuario) {
        try {
            List<Transaccion> transacciones = transaccionController.getTransaccionesPorUsuario(idUsuario);
            return Response.ok(transacciones).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener transacciones: " + e.getMessage()).build();
        }
    }
}