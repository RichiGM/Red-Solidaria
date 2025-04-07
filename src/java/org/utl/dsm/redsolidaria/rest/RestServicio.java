package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.model.Servicio;
import org.utl.dsm.redsolidaria.controller.ControllerServicio;
import org.utl.dsm.redsolidaria.model.Habilidad;

@Path("/servicio")
public class RestServicio {

    private final ControllerServicio servicioController = new ControllerServicio();
    private final Gson gson = new Gson();
    
    @POST
    @Path("/agregar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response agregarServicio(String servicioJson) {
        try {
            Servicio servicio = gson.fromJson(servicioJson, Servicio.class);
            servicioController.agregarServicio(servicio);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Servicio agregado exitosamente");
            String jsonResponse = gson.toJson(response);
            return Response.status(Response.Status.CREATED).entity(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al agregar el servicio: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }

    @PUT
    @Path("/modificar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response modificarServicio(String servicioJson) {
        try {
            Servicio servicio = gson.fromJson(servicioJson, Servicio.class);
            servicioController.modificarServicio(servicio);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Servicio modificado exitosamente");
            String jsonResponse = gson.toJson(response);
            return Response.ok(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al modificar el servicio: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }

    @GET
    @Path("/mis-servicios")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerMisServicios(@QueryParam("idUsuario") int idUsuario) {
        try {
            List<Servicio> servicios = servicioController.obtenerMisServicios(idUsuario);
            String jsonResponse = gson.toJson(servicios);
            return Response.ok(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener los servicios: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }
    
    @PUT
    @Path("/desactivar")
    @Produces(MediaType.APPLICATION_JSON)
    public Response desactivarServicio(@QueryParam("idServicio") int idServicio) {
        try {
            servicioController.eliminarServicio(idServicio); // Esto debe poner estatus = 2 en BD
            Map<String, String> response = new HashMap<>();
            response.put("message", "Servicio desactivado exitosamente");
            String jsonResponse = gson.toJson(response);
            return Response.ok(jsonResponse).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al desactivar el servicio: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }

    
    @GET
    @Path("/destacados")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getServiciosDestacados() {
        try {
            List<Map<String, Object>> servicios = servicioController.getServiciosDestacados();
            return Response.ok(servicios).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener los servicios destacados: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }
    
    @GET
    @Path("/todos")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTodosServicios() {
        try {
            List<Map<String, Object>> servicios = servicioController.getTodosServicios();
            return Response.ok(servicios).build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener todos los servicios: " + e.getMessage());
            String jsonError = gson.toJson(errorResponse);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(jsonError).build();
        }
    }
    
    @GET
    @Path("/todas")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerTodasLasHabilidades() {
        try {
            List<Habilidad> habilidades = servicioController.obtenerTodas();
            String json = gson.toJson(habilidades);
            return Response.ok(json).build();
        } catch (Exception e) {
            String errorJson = gson.toJson("Error al obtener habilidades: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorJson).build();
        }
    }
}