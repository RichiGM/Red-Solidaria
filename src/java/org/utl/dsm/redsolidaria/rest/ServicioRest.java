package org.utl.dsm.redsolidaria.rest;

import org.utl.dsm.redsolidaria.model.Servicio;
import org.utl.dsm.redsolidaria.controller.ServicioController;
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

@Path("/servicio")
public class ServicioRest {

    private final ServicioController servicioController = new ServicioController();

    // Crear un nuevo servicio
    @POST
    @Path("/publicar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response publicarServicio(Servicio servicio) {
        try {
            servicioController.publicarServicio(servicio);
            return Response.status(Response.Status.CREATED).entity("Servicio publicado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al publicar servicio: " + e.getMessage()).build();
        }
    }

    // Obtener un servicio por ID
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getServicio(@PathParam("id") int id) {
        try {
            Servicio servicio = servicioController.getServicioById(id);
            if (servicio != null) {
                return Response.ok(servicio).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).entity("Servicio no encontrado").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener servicio: " + e.getMessage()).build();
        }
    }

    // Actualizar un servicio
    @PUT
    @Path("/actualizar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizarServicio(Servicio servicio) {
        try {
            servicioController.actualizarServicio(servicio);
            return Response.ok("Servicio actualizado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al actualizar servicio: " + e.getMessage()).build();
        }
    }

    // Eliminar un servicio
    @DELETE
    @Path("/eliminar/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response eliminarServicio(@PathParam("id") int id) {
        try {
            servicioController.eliminarServicio(id);
            return Response.ok("Servicio eliminado exitosamente").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al eliminar servicio: " + e.getMessage()).build();
        }
    }

    // Obtener todos los servicios
    @GET
    @Path("/todos")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTodosServicios() {
        try {
            List<Servicio> servicios = servicioController.getTodosServicios();
            return Response.ok(servicios).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al obtener servicios: " + e.getMessage()).build();
        }
    }
}