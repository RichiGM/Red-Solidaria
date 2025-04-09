package org.utl.dsm.redsolidaria.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import org.utl.dsm.redsolidaria.controller.ControllerNotificacion;
import org.utl.dsm.redsolidaria.model.Notificacion;

/**
 *
 * @author danna
 */

@Path("notificacion")
public class RestNotificacion {
    
    @Path("getAll")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll(@QueryParam("idUsuario") String idUsuario) {
        ControllerNotificacion cn = new ControllerNotificacion();
        String out = "";
        try {
            List<Notificacion> notificaciones = cn.getAll(Integer.parseInt(idUsuario));
            Gson gson = new Gson();
            out = gson.toJson(notificaciones);
            return Response.status(Response.Status.OK).entity(out).build();
        } catch (Exception e) {
            e.printStackTrace();
            out = "{\"error\":\"" + e.toString() + "\"}";
            return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
        }
    }
    
    @Path("getPendientes")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPendientes(@QueryParam("idUsuario") String idUsuario) {
        ControllerNotificacion cn = new ControllerNotificacion();
        String out = "";
        try {
            List<Notificacion> notificaciones = cn.getPendientes(Integer.parseInt(idUsuario));
            Gson gson = new Gson();
            out = gson.toJson(notificaciones);
            return Response.status(Response.Status.OK).entity(out).build();
        } catch (Exception e) {
            e.printStackTrace();
            out = "{\"error\":\"" + e.toString() + "\"}";
            return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
        }
    }
    
    @Path("marcarLeida")
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response marcarLeida(@QueryParam("idNotificacion") String idNotificacion) {
        ControllerNotificacion cn = new ControllerNotificacion();
        String out = "";
        try {
            boolean result = cn.marcarLeida(Integer.parseInt(idNotificacion));
            if (result) {
                out = "{\"result\":\"Notificación marcada como leída\"}";
                return Response.status(Response.Status.OK).entity(out).build();
            } else {
                out = "{\"error\":\"No se pudo marcar la notificación como leída\"}";
                return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            out = "{\"error\":\"" + e.toString() + "\"}";
            return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
        }
    }
    
    @Path("marcarTodasLeidas")
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response marcarTodasLeidas(@QueryParam("idUsuario") String idUsuario) {
        ControllerNotificacion cn = new ControllerNotificacion();
        String out = "";
        try {
            boolean result = cn.marcarTodasLeidas(Integer.parseInt(idUsuario));
            if (result) {
                out = "{\"result\":\"Todas las notificaciones marcadas como leídas\"}";
                return Response.status(Response.Status.OK).entity(out).build();
            } else {
                out = "{\"error\":\"No se pudieron marcar todas las notificaciones como leídas\"}";
                return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            out = "{\"error\":\"" + e.toString() + "\"}";
            return Response.status(Response.Status.BAD_REQUEST).entity(out).build();
        }
    }
}
