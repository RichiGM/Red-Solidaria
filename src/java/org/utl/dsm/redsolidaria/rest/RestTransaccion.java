package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.QueryParam;
import java.sql.Connection;
import org.utl.dsm.redsolidaria.adapters.LocalDateAdapter;
import org.utl.dsm.redsolidaria.controller.ControllerTransaccion;
import org.utl.dsm.redsolidaria.model.Transaccion;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.utl.dsm.redsolidaria.bd.ConexionMySql;
import org.utl.dsm.redsolidaria.model.Intercambio;
import org.utl.dsm.redsolidaria.model.TransaccionDTO;
import org.utl.dsm.redsolidaria.model.Usuario;

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

    @PUT
    @Path("/verificar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response verificarTransaccion(String json) {
        try {
            Transaccion transaccion = gson.fromJson(json, Transaccion.class);
            boolean resultado = transaccionController.verificarTransaccion(transaccion);

            if (resultado) {
                return Response.ok("{\"success\": true, \"message\": \"Transacción verificada correctamente\"}")
                        .header("Access-Control-Allow-Origin", "*")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"success\": false, \"message\": \"No se pudo verificar la transacción\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Error al verificar la transacción: " + e.getMessage() + "\"}")
                    .build();
        }
    }

@POST
@Path("/solicitar")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public Response solicitarTransaccion(String json) {
    try {
        // Convertir JSON directamente a TransaccionDTO
        TransaccionDTO transaccionDTO = gson.fromJson(json, TransaccionDTO.class);
        
        // Validaciones
        if (transaccionDTO.getIdUsuarioOferente() == 0 || transaccionDTO.getIdUsuarioSolicitante() == 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Se deben especificar tanto el oferente como el solicitante\"}")
                    .build();
        }
        
        if (transaccionDTO.getIdUsuarioOferente() == transaccionDTO.getIdUsuarioSolicitante()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"No puedes crear una transacción contigo mismo\"}")
                    .build();
        }
        
        if (transaccionDTO.getHorasIntercambiadas() <= 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Las horas intercambiadas deben ser mayores a 0\"}")
                    .build();
        }

        // Convertir DTO a modelo para el controlador
        Transaccion transaccion = convertDtoToModel(transaccionDTO);
        
        // Llamar al controlador para crear la transacción
        TransaccionDTO nuevaTransaccionDTO = transaccionController.crearTransaccion(transaccion);
        
        return Response.ok(gson.toJson(nuevaTransaccionDTO))
                .header("Access-Control-Allow-Origin", "*")
                .build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error al crear la transacción: " + e.getMessage() + "\"}")
                .build();
    }
}

// Método auxiliar para convertir DTO a Model
private Transaccion convertDtoToModel(TransaccionDTO dto) {
    Transaccion transaccion = new Transaccion();
    transaccion.setIdTransaccion(dto.getIdTransaccion());
    transaccion.setHorasIntercambiadas(dto.getHorasIntercambiadas());
    transaccion.setFecha(LocalDate.parse(dto.getFecha())); // Convertir String a LocalDate
    transaccion.setDetalles(dto.getDetalles());
    transaccion.setVerificadoOferente(dto.isVerificadoOferente());
    transaccion.setVerificadoSolicitante(dto.isVerificadoSolicitante());
    transaccion.setTituloServicio(dto.getTituloServicio());
    transaccion.setEstatus(dto.getEstatus());
    transaccion.setHorasRecibidas(dto.getHorasRecibidas());
    transaccion.setHorasOfrecidas(dto.getHorasOfrecidas());
    transaccion.setIntercambiosCompletados(dto.getIntercambiosCompletados());

    // Aquí puedes establecer el intercambio, si es necesario
    Intercambio intercambio = new Intercambio();
    intercambio.setIdIntercambio(dto.getIdIntercambio());
    transaccion.setIntercambio(intercambio);

    // Aquí puedes establecer los usuarios oferente y solicitante
    Usuario oferente = new Usuario();
    oferente.setIdUsuario(dto.getIdUsuarioOferente());
    transaccion.setOferente(oferente);

    Usuario solicitante = new Usuario();
    solicitante.setIdUsuario(dto.getIdUsuarioSolicitante());
    transaccion.setSolicitante(solicitante);

    return transaccion;
}
}
