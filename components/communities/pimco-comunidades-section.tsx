"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, ExternalLink, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CommunitySelector from "./community-selector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LinkedCommunity {
  id: string;
  community_id: string;
  added_at: string;
  is_active: boolean;
  notes: string | null;
  communities: {
    id: string;
    department: string;
    municipality: string;
    villages: string;
    hamlets_served: string | null;
    hamlets_count: number | null;
    google_maps_url: string | null;
    leader_name: string | null;
    leader_phone: string | null;
    status: "activa" | "inactiva" | "suspendida";
    total_families: number | null;
    families_in_ra: number | null;
    classification: "Pequeña" | "Mediana" | "Grande" | null;
  };
}

export default function PimcoComunidadesSection() {
  const [linkedCommunities, setLinkedCommunities] = useState<LinkedCommunity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<LinkedCommunity | null>(
    null
  );

  const fetchLinkedCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/community-profile-links?active_only=true&include_community=true"
      );

      if (!response.ok) {
        throw new Error("Error al cargar comunidades vinculadas");
      }

      const data = await response.json();
      setLinkedCommunities(data.links || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar comunidades del Perfil Comunitario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedCommunities();
  }, []);

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;

    try {
      const response = await fetch(
        `/api/community-profile-links/${linkToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al desvincular comunidad");
      }

      toast.success("Comunidad desvinculada del Perfil Comunitario");
      fetchLinkedCommunities();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al desvincular comunidad");
    } finally {
      setLinkToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Cargando comunidades del Perfil Comunitario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Comunidades en Perfil Comunitario
          </h2>
          <p className="text-muted-foreground">
            {linkedCommunities.length}{" "}
            {linkedCommunities.length === 1
              ? "comunidad vinculada"
              : "comunidades vinculadas"}
          </p>
        </div>
        <Button
          onClick={() => setShowSelector(true)}
          size="sm"
          className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Seleccionar Comunidades
        </Button>
      </div>

      {/* Tabla */}
      {linkedCommunities.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay comunidades vinculadas
          </h3>
          <p className="text-muted-foreground mb-6">
            Haz clic en &quot;Seleccionar Comunidades&quot; para agregar aldeas
            al Perfil Comunitario
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aldea/Comunidad</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Familias</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Agregada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedCommunities.map((link) => {
                const community = link.communities;
                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div>{community.villages || "Sin nombre"}</div>
                          {community.hamlets_count && (
                            <div className="text-xs text-muted-foreground">
                              {community.hamlets_count}{" "}
                              {community.hamlets_count === 1
                                ? "caserío"
                                : "caseríos"}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{community.department}</TableCell>
                    <TableCell>{community.municipality}</TableCell>
                    <TableCell>
                      {community.leader_name ? (
                        <div>
                          <div className="text-sm">{community.leader_name}</div>
                          {community.leader_phone && (
                            <div className="text-xs text-muted-foreground">
                              {community.leader_phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No asignado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{community.total_families || 0}</span>
                        {community.families_in_ra && (
                          <span className="text-xs text-muted-foreground">
                            ({community.families_in_ra} RA)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {community.classification ? (
                        <Badge
                          variant={
                            community.classification === "Grande"
                              ? "default"
                              : community.classification === "Mediana"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {community.classification}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          community.status === "activa"
                            ? "default"
                            : community.status === "suspendida"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {community.status === "activa"
                          ? "Activa"
                          : community.status === "suspendida"
                          ? "Suspendida"
                          : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(link.added_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {community.google_maps_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                community.google_maps_url || "",
                                "_blank"
                              )
                            }
                            title="Ver en Google Maps"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Desvincular"
                          onClick={() => setLinkToDelete(link)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Selector de comunidades */}
      <CommunitySelector
        open={showSelector}
        onOpenChange={setShowSelector}
        onSuccess={fetchLinkedCommunities}
      />

      {/* Dialog de confirmación para desvincular */}
      <AlertDialog
        open={!!linkToDelete}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular comunidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto removerá{" "}
              <strong>{linkToDelete?.communities?.villages}</strong> del Perfil
              Comunitario. La comunidad seguirá existiendo en la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              className="bg-red-600 hover:bg-red-700"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
