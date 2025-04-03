package org.utl.dsm.redsolidaria.rest;

import jakarta.annotation.Priority;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.utl.dsm.redsolidaria.bd.ConexionMySql;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class RestFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();

        // 🔹 Permitir acceso libre a login, logout y cheecky
        if (path.contains("login/validate") || 
                path.contains("login/check") || 
                path.contains("ubicacion/estados") || 
                path.contains("ubicacion/ciudades")|| 
                path.contains("usuario/verificar-email")|| 
                path.contains("usuario/registrar")){
            return; // No se requiere autenticación para estas rutas
        }

        // 🔹 Obtener el lastToken desde los headers
        String lastToken = requestContext.getHeaderString("Authorization");

        // 🔹 Si el token tiene el prefijo "Bearer", eliminarlo
        if (lastToken != null && lastToken.startsWith("Bearer ")) {
            lastToken = lastToken.substring(7); // Eliminar "Bearer " del inicio del token
        }

        // 🔹 Si no hay token o es inválido, bloquear la solicitud con un 401 Unauthorized
        if (lastToken == null || lastToken.isEmpty() || !searchTokenValido(lastToken)) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Acceso denegado: Token inválido o ausente.\"}")
                    .build());
        }
    }

    // Método para buscar el token en la base de datos
    public boolean searchTokenValido(String lastToken) {
        String query = "SELECT COUNT(*) FROM USUARIO WHERE lastToken = ?"; // Consulta corregida

        ConexionMySql conexionMySql = new ConexionMySql();
        Connection conn = null;
        boolean res = false;

        try {
            conn = conexionMySql.open();
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, lastToken); // Establecemos el token recibido

            ResultSet rs = ps.executeQuery();

            if (rs.next() && rs.getInt(1) > 0) {
                res = true; // Si hay coincidencias, el token es válido
            }
        } catch (SQLException e) {
            res = false;
            e.printStackTrace();
            throw new RuntimeException("Error al buscar token válido: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.close(); // Cerramos la conexión de forma segura
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        return res;
    }
}
