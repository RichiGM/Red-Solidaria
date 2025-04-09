package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.utl.dsm.redsolidaria.adapters.LocalDateAdapter;
import org.utl.dsm.redsolidaria.model.Intercambio;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import org.utl.dsm.redsolidaria.bd.ConexionMySql;

@Path("/intercambio")
public class RestIntercambio {

    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();
    private final ConexionMySql conexion = new ConexionMySql();

    @POST
    @Path("/crear")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crearIntercambio(String json) {
        try {
            Intercambio intercambio = gson.fromJson(json, Intercambio.class);

            // Validaciones básicas
            if (intercambio.getIdUsuarioSolicitante() == 0 || intercambio.getIdUsuarioOferente() == 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Se deben especificar tanto el solicitante como el oferente\"}")
                        .build();
            }

            if (intercambio.getIdUsuarioSolicitante() == intercambio.getIdUsuarioOferente()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"El solicitante y el oferente no pueden ser el mismo usuario\"}")
                        .build();
            }

            String query = "INSERT INTO Intercambio (dia, hora, estatus, idUsuarioSolicitante, idUsuarioOferente) " +
                          "VALUES (?, ?, ?, ?, ?)";
            
            try (Connection conn = conexion.open();
                 PreparedStatement ps = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
                
                ps.setString(1, intercambio.getDia() != null ? intercambio.getDia().toString() : null);
                ps.setString(2, intercambio.getHora());
                ps.setInt(3, intercambio.getEstatus());
                ps.setInt(4, intercambio.getIdUsuarioSolicitante());
                ps.setInt(5, intercambio.getIdUsuarioOferente());
                
                int filasAfectadas = ps.executeUpdate();
                
                if (filasAfectadas > 0) {
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) {
                            intercambio.setIdIntercambio(rs.getInt(1));
                        }
                    }
                    return Response.ok(gson.toJson(intercambio))
                            .header("Access-Control-Allow-Origin", "*")
                            .build();
                } else {
                    throw new Exception("No se pudo crear el intercambio");
                }
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Error al crear el intercambio: " + e.getMessage() + "\"}")
                    .build();
        }
    }
}