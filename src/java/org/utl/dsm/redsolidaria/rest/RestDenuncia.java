package org.utl.dsm.redsolidaria.rest;

import org.utl.dsm.redsolidaria.model.Denuncia;
import org.utl.dsm.redsolidaria.controller.ControllerDenuncia;
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

@Path("/denuncia")
public class RestDenuncia {

    private final ControllerDenuncia denunciaController = new ControllerDenuncia();

    // Crear una nueva denuncia
    @POST
    @Path("/reportar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reportarDenuncia(Denuncia denuncia) {
        try {
            denunciaController.reportarDenuncia(denuncia);
            return Response.status(Response.Status.CREATED).entity("Denuncia reportada exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al reportar denuncia: " + e.getMessage()).build();
        }
    }

    // Obtener todas las denuncias
    @GET
    @Path("/todos")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTodasDenuncias() {
        try {
            List<Denuncia> denuncias = denunciaController.getTodasDenuncias();
            return Response.ok(denuncias).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener denuncias: " + e.getMessage()).build();
        }
    }
}