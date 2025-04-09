package org.utl.dsm.redsolidaria.rest;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import java.sql.Connection;
import java.sql.PreparedStatement;
import org.utl.dsm.redsolidaria.bd.ConexionMySql;

@Path("/servicio-intercambio")
public class RestServicioIntercambio {

    private final Gson gson = new Gson();
    private final ConexionMySql conexion = new ConexionMySql();

    // Clase interna para representar el ServicioIntercambio
    private static class ServicioIntercambio {
        private int idServicio;
        private int idIntercambio;

        public int getIdServicio() { return idServicio; }
        public void setIdServicio(int idServicio) { this.idServicio = idServicio; }
        public int getIdIntercambio() { return idIntercambio; }
        public void setIdIntercambio(int idIntercambio) { this.idIntercambio = idIntercambio; }
    }

    @POST
    @Path("/crear")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crearServicioIntercambio(String json) {
        try {
            ServicioIntercambio si = gson.fromJson(json, ServicioIntercambio.class);

            // Validar que los IDs no sean cero
            if (si.getIdServicio() <= 0 || si.getIdIntercambio() <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Se deben especificar idServicio e idIntercambio válidos\"}")
                        .build();
            }

            String query = "INSERT INTO ServicioIntercambio (idServicio, idIntercambio) VALUES (?, ?)";
            
            try (Connection conn = conexion.open();
                 PreparedStatement ps = conn.prepareStatement(query)) {
                
                ps.setInt(1, si.getIdServicio());
                ps.setInt(2, si.getIdIntercambio());
                
                int filasAfectadas = ps.executeUpdate();
                
                if (filasAfectadas > 0) {
                    return Response.ok(gson.toJson(si))
                            .header("Access-Control-Allow-Origin", "*")
                            .build();
                } else {
                    throw new Exception("No se pudo vincular el servicio con el intercambio");
                }
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Error al vincular servicio con intercambio: " + e.getMessage() + "\"}")
                    .build();
        }
    }
}