package org.utl.dsm.redsolidaria.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.redsolidaria.adapters.LocalDateAdapter;
import org.utl.dsm.redsolidaria.controller.ControllerCalificacion;
import org.utl.dsm.redsolidaria.model.Calificacion;

import java.time.LocalDate;

@Path("/calificacion")
public class RestCalificacion {

    private final ControllerCalificacion calificacionController = new ControllerCalificacion();
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();

    @POST
    @Path("/calificar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response calificarUsuario(String json) {
        try {
            Calificacion calificacion = gson.fromJson(json, Calificacion.class);
            int idCalificacion = calificacionController.insertarCalificacion(calificacion);
            
            if (idCalificacion > 0) {
                return Response.ok("{\"success\": true, \"message\": \"Calificación registrada correctamente\", \"idCalificacion\": " + idCalificacion + "}")
                        .header("Access-Control-Allow-Origin", "*")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"success\": false, \"message\": \"No se pudo registrar la calificación\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Error al registrar la calificación: " + e.getMessage() + "\"}")
                    .build();
        }
    }
}