"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Community } from "@/lib/types/community";
import {
  MapPin,
  Users,
  Phone,
  FileText,
  ExternalLink,
  Package,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community | null;
}

export default function CommunityViewModal({
  open,
  onOpenChange,
  community,
}: CommunityViewModalProps) {
  if (!community) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activa":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Activa
          </Badge>
        );
      case "suspendida":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Suspendida
          </Badge>
        );
      case "inactiva":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Inactiva
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPopulation =
    (community.early_childhood_women || 0) +
    (community.early_childhood_men || 0) +
    (community.childhood_3_5_women || 0) +
    (community.childhood_3_5_men || 0) +
    (community.youth_6_10_women || 0) +
    (community.youth_6_10_men || 0) +
    (community.adults_11_18_women || 0) +
    (community.adults_11_18_men || 0) +
    (community.adults_19_60_women || 0) +
    (community.adults_19_60_men || 0) +
    (community.seniors_61_plus_women || 0) +
    (community.seniors_61_plus_men || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {community.villages || "Sin nombre"}
            </DialogTitle>
            {getStatusBadge(community.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {community.department} • {community.municipality}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Datos Básicos */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Ubicación
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Fecha de Inscripción:
                  </span>
                  <p className="text-gray-900">
                    {formatDate(community.registration_date)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Departamento:
                  </span>
                  <p className="text-gray-900">{community.department}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Municipio:</span>
                  <p className="text-gray-900">{community.municipality}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Aldea/Comunidad:
                  </span>
                  <p className="text-gray-900">{community.villages || "-"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Cantidad de Caseríos:
                  </span>
                  <p className="text-gray-900">
                    {community.hamlets_count || 0}
                  </p>
                </div>
                {community.hamlets_served && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Caseríos que Atiende:
                    </span>
                    <p className="text-gray-900">{community.hamlets_served}</p>
                  </div>
                )}
                {community.google_maps_url && (
                  <div className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(community.google_maps_url || "", "_blank")
                      }
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver en Google Maps
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* Líder y Comité */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                <Users className="w-5 h-5 text-purple-600" />
                Liderazgo
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Nombre del Líder:
                  </span>
                  <p className="text-gray-900">
                    {community.leader_name || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Teléfono del Líder:
                  </span>
                  <p className="text-gray-900 flex items-center gap-1">
                    {community.leader_phone ? (
                      <>
                        <Phone className="w-3 h-3" />
                        {community.leader_phone}
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    En Grupo de Líderes:
                  </span>
                  <p className="text-gray-900">
                    <Badge
                      variant={
                        community.is_in_leaders_group ? "default" : "outline"
                      }
                    >
                      {community.is_in_leaders_group ? "Sí" : "No"}
                    </Badge>
                  </p>
                </div>
                {community.community_committee && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Comité Comunitario:
                    </span>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {community.community_committee}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Familias */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                <Users className="w-5 h-5 text-green-600" />
                Familias
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Total de Familias:
                  </span>
                  <p className="text-gray-900 text-xl font-bold">
                    {community.total_families || 0}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Familias en RA:
                  </span>
                  <p className="text-gray-900 text-xl font-bold">
                    {community.families_in_ra || 0}
                  </p>
                </div>
              </div>
            </section>

            {/* Demografía */}
            {totalPopulation > 0 && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Población ({totalPopulation} personas)
                </h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Primera Infancia (0-2)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.early_childhood_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.early_childhood_men}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Infancia (3-5)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.childhood_3_5_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.childhood_3_5_men}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Juventud (6-10)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.youth_6_10_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.youth_6_10_men}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Adolescentes (11-18)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.adults_11_18_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.adults_11_18_men}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Adultos (19-60)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.adults_19_60_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.adults_19_60_men}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Adultos Mayores (61+)
                    </span>
                    <p className="text-gray-900">
                      Mujeres: {community.seniors_61_plus_women}
                    </p>
                    <p className="text-gray-900">
                      Hombres: {community.seniors_61_plus_men}
                    </p>
                  </div>
                  {(community.pregnant_women > 0 ||
                    community.lactating_women > 0) && (
                    <div className="col-span-3 bg-red-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">
                        Salud Materna
                      </span>
                      <p className="text-gray-900">
                        Gestantes: {community.pregnant_women}
                      </p>
                      <p className="text-gray-900">
                        Lactantes: {community.lactating_women}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Operación */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Operación
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {community.classification && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Clasificación:
                    </span>
                    <p className="text-gray-900">
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
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">
                    Grupo de WhatsApp:
                  </span>
                  <p className="text-gray-900">
                    <Badge
                      variant={
                        community.has_whatsapp_group ? "default" : "outline"
                      }
                      className="gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {community.has_whatsapp_group ? "Sí" : "No"}
                    </Badge>
                  </p>
                </div>
                {community.placement_type && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Tipo de Colocación:
                    </span>
                    <p className="text-gray-900">{community.placement_type}</p>
                  </div>
                )}
                {community.storage_capacity && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Capacidad de Almacenamiento:
                    </span>
                    <p className="text-gray-900">
                      {community.storage_capacity}
                    </p>
                  </div>
                )}
                {community.placement_methods && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Formas de Colocación:
                    </span>
                    <p className="text-gray-900">
                      {community.placement_methods}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Estado e Inactividad */}
            {(community.status !== "activa" ||
              community.inactive_reason ||
              community.termination_reason) && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 border-b pb-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Estado e Inactividad
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {community.inactive_reason && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">
                        Razón de Inactividad:
                      </span>
                      <p className="text-gray-900">
                        {community.inactive_reason}
                      </p>
                    </div>
                  )}
                  {community.termination_date && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Fecha de Baja:
                      </span>
                      <p className="text-gray-900">
                        {formatDate(community.termination_date)}
                      </p>
                    </div>
                  )}
                  {community.termination_reason && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">
                        Motivo de Baja:
                      </span>
                      <p className="text-gray-900">
                        {community.termination_reason}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Auditoría */}
            <section className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700">
                Información de Auditoría
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Creado:</span>
                  <p>{formatDate(community.created_at)}</p>
                </div>
                <div>
                  <span className="font-medium">Actualizado:</span>
                  <p>{formatDate(community.updated_at)}</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
