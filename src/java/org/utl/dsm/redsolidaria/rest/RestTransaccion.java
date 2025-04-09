package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.ws.rs.QueryParam;
import org.utl.dsm.redsolidaria.adapters.LocalDateAdapter;
import org.utl.dsm.redsolidaria.controller.ControllerTransaccion;
import org.utl.dsm.redsolidaria.model.Transaccion;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.utl.dsm.redsolidaria.model.TransaccionDTO;

@Path("/transaccion")
public class RestTransaccion {

    private final ControllerTransaccion transaccionController = new ControllerTransaccion();
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();

    @GET
    @Path("/usuario/{idUsuario}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTransaccionesPorUsuario(
            @PathParam("idUsuario") int idUsuario,
            @QueryParam("tipo") String tipo,
            @QueryParam("estado") String estado,
            @QueryParam("fecha") String fecha) {
        try {
            List<Transaccion> transacciones = transaccionController.getTransaccionesPorUsuario(idUsuario, tipo, estado, fecha);

            List<TransaccionDTO> dtos = new ArrayList<>();
            for (Transaccion t : transacciones) {
                dtos.add(TransaccionDTO.fromTransaccion(t));
            }

            return Response.ok(gson.toJson(dtos))
                    .header("Access-Control-Allow-Origin", "*")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Error al obtener transacciones: " + e.getMessage() + "\"}")
                    .build();
        }
    }
}
