package org.utl.dsm.redsolidaria.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.utl.dsm.redsolidaria.controller.ControllerUbicacion;
import org.utl.dsm.redsolidaria.model.Ciudad;
import org.utl.dsm.redsolidaria.model.Estado;

@Path("/ubicacion")
public class RestUbicacion {

    private final ControllerUbicacion ubicacionController = new ControllerUbicacion();
    private final Gson gson = new Gson();

    // Obtener todos los estados
    @GET
    @Path("/estados")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getEstados() {
        try {
            List<Estado> estados = ubicacionController.getTodosEstados();
            String jsonResponse = gson.toJson(estados);
            return Response.ok(jsonResponse).build();
        } catch (SQLException e) {
            e.printStackTrace();
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Error al obtener estados: " + e.getMessage());
            String errorResponse = gson.toJson(errorMap);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity(errorResponse)
                           .build();
        }
    }

    // Obtener todas las ciudades de un estado
    @GET
    @Path("/ciudades/{idEstado}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCiudadesPorEstado(@PathParam("idEstado") int idEstado) {
        try {
            List<Ciudad> ciudades = ubicacionController.getCiudadesPorEstado(idEstado);
            String jsonResponse = gson.toJson(ciudades);
            return Response.ok(jsonResponse).build();
        } catch (SQLException e) {
            e.printStackTrace();
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Error al obtener ciudades: " + e.getMessage());
            String errorResponse = gson.toJson(errorMap);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity(errorResponse)
                           .build();
        }
    }
}