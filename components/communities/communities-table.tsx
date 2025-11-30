/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  ExternalLink,
  Download,
} from "lucide-react";
import { Community } from "@/lib/types/community";
import { toast } from "sonner";
import DateFilter from "@/components/shared/date-filter";
import CommunitySelector from "./community-selector";
import CommunityCrudForm from "./community-crud-form";
import CommunityViewModal from "./community-view-modal";
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

export default function CommunitiesTable() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showCrudForm, setShowCrudForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null
  );

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(50);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [municipalityFilter, setMunicipalityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "activa" | "inactiva" | "suspendida" | ""
  >("");
  const [classificationFilter, setClassificationFilter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Opciones dinámicas de filtros (desde la API)
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<string[]>([]);

  // Cargar todas las comunidades para generar opciones de filtros
  const fetchAllCommunitiesForFilters = async () => {
    try {
      const response = await fetch('/api/communities?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const allData = data.communities || [];
        setAllCommunities(allData);
        
        // Extraer departamentos únicos
        const uniqueDepts = [...new Set(allData.map((c: Community) => c.department).filter(Boolean))] as string[];
        setDepartments(uniqueDepts.sort());
        
        // Extraer clasificaciones únicas
        const uniqueClassifications = [...new Set(allData.map((c: Community) => c.classification).filter(Boolean))] as string[];
        setClassifications(uniqueClassifications.sort());
      }
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
    }
  };

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (departmentFilter) {
      const munis = allCommunities
        .filter(c => c.department === departmentFilter)
        .map(c => c.municipality)
        .filter(Boolean);
      const uniqueMunis = [...new Set(munis)].sort();
      setMunicipalities(uniqueMunis);
      setMunicipalityFilter(''); // Reset municipality cuando cambia department
    } else {
      setMunicipalities([]);
    }
  }, [departmentFilter, allCommunities]);

  // Cargar comunidades
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (departmentFilter) params.append("department", departmentFilter);
      if (municipalityFilter) params.append("municipality", municipalityFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (classificationFilter)
        params.append("classification", classificationFilter);
      if (selectedYear !== "all") params.append("year", selectedYear);
      if (selectedMonth !== "all") params.append("month", selectedMonth);

      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = "Error al cargar comunidades";
        if (errorData.code === "42501") {
          errorMessage = "Error de permisos RLS";
        } else if (errorData.details) {
          errorMessage = `Error: ${errorData.details}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCommunities(data.communities || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Error al cargar comunidades");
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones de filtros al montar
  useEffect(() => {
    fetchAllCommunitiesForFilters();
  }, []);

  // Cargar comunidades cuando cambian filtros
  useEffect(() => {
    fetchCommunities();
  }, [
    currentPage,
    searchTerm,
    departmentFilter,
    municipalityFilter,
    statusFilter,
    classificationFilter,
    selectedYear,
    selectedMonth,
  ]);

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, municipalityFilter, statusFilter, classificationFilter, selectedYear, selectedMonth]);

  // Manejar edición
  const handleEdit = (community: Community) => {
    setSelectedCommunity(community);
    setShowCrudForm(true);
  };

  // Manejar eliminación
  const handleDeleteConfirm = async () => {
    if (!communityToDelete) return;

    try {
      const response = await fetch(`/api/communities/${communityToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar comunidad");
      }

      toast.success("Comunidad eliminada exitosamente");
      fetchCommunities();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar comunidad");
    } finally {
      setCommunityToDelete(null);
    }
  };

  // Exportar a Excel
  const handleExport = async () => {
    toast.info("Exportación en construcción");
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
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
          <p className="text-muted-foreground">Cargando comunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comunidades Beneficiarias</h2>
          <p className="text-muted-foreground">
            {total}{" "}
            {total === 1 ? "comunidad registrada" : "comunidades registradas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button
            onClick={() => {
              setSelectedCommunity(null);
              setShowCrudForm(true);
            }}
            size="sm"
            className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Agregar Comunidad
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aldea o líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={departmentFilter || "all"}
          onValueChange={(value) =>
            setDepartmentFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={municipalityFilter || "all"}
          onValueChange={(value) =>
            setMunicipalityFilter(value === "all" ? "" : value)
          }
          disabled={!departmentFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Municipio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los municipios</SelectItem>
            {municipalities.map((muni) => (
              <SelectItem key={muni} value={muni}>
                {muni}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(
              value === "all" ? "" : (value as typeof statusFilter)
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="inactiva">Inactiva</SelectItem>
            <SelectItem value="suspendida">Suspendida</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={classificationFilter || "all"}
          onValueChange={(value) =>
            setClassificationFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Clasificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las clasificaciones</SelectItem>
            {classifications.map((classification) => (
              <SelectItem key={classification} value={classification}>
                {classification}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Fecha de Registro:
        </span>
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          showIcons={false}
        />
      </div>

      {/* Tabla con scroll horizontal para todas las columnas */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Columnas básicas */}
              <TableHead className="min-w-[150px]">Aldea/Comunidad</TableHead>
              <TableHead className="min-w-[120px]">Departamento</TableHead>
              <TableHead className="min-w-[150px]">Municipio</TableHead>
              <TableHead className="min-w-[100px]">Caseríos</TableHead>

              {/* Información del líder */}
              <TableHead className="min-w-[150px]">Líder</TableHead>
              <TableHead className="min-w-[120px]">Teléfono</TableHead>
              <TableHead className="min-w-[100px]">Grupo Líderes</TableHead>
              <TableHead className="min-w-[200px]">Comité</TableHead>

              {/* Estado */}
              <TableHead className="min-w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[150px]">Razón Inactiva</TableHead>

              {/* Familias */}
              <TableHead className="min-w-[100px]">Total Familias</TableHead>
              <TableHead className="min-w-[100px]">Familias RA</TableHead>

              {/* Demografía (14 columnas) */}
              <TableHead className="min-w-20">Mujeres 0-2</TableHead>
              <TableHead className="min-w-20">Hombres 0-2</TableHead>
              <TableHead className="min-w-20">Mujeres 3-5</TableHead>
              <TableHead className="min-w-20">Hombres 3-5</TableHead>
              <TableHead className="min-w-20">Mujeres 6-10</TableHead>
              <TableHead className="min-w-20">Hombres 6-10</TableHead>
              <TableHead className="min-w-[90px]">Mujeres 11-18</TableHead>
              <TableHead className="min-w-[90px]">Hombres 11-18</TableHead>
              <TableHead className="min-w-[90px]">Mujeres 19-60</TableHead>
              <TableHead className="min-w-[90px]">Hombres 19-60</TableHead>
              <TableHead className="min-w-[90px]">Mujeres 61+</TableHead>
              <TableHead className="min-w-[90px]">Hombres 61+</TableHead>
              <TableHead className="min-w-20">Gestantes</TableHead>
              <TableHead className="min-w-20">Lactantes</TableHead>

              {/* Otros datos */}
              <TableHead className="min-w-[120px]">Tipo Colocación</TableHead>
              <TableHead className="min-w-[100px]">Whatsapp</TableHead>
              <TableHead className="min-w-[120px]">Clasificación</TableHead>
              <TableHead className="min-w-[150px]">Capacidad Almac.</TableHead>
              <TableHead className="min-w-[150px]">Formas Colocación</TableHead>

              {/* Fechas */}
              <TableHead className="min-w-[120px]">Fecha Inscripción</TableHead>
              <TableHead className="min-w-[120px]">Fecha Baja</TableHead>
              <TableHead className="min-w-[150px]">Motivo Baja</TableHead>

              {/* Auditoría */}
              <TableHead className="min-w-[120px]">Creado</TableHead>
              <TableHead className="min-w-[120px]">Actualizado</TableHead>

              {/* Acciones fijas */}
              <TableHead className="sticky right-0 bg-white border-l min-w-[180px] text-right shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={35}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron comunidades
                </TableCell>
              </TableRow>
            ) : (
              communities.map((community) => (
                <TableRow key={community.id}>
                  {/* Columnas básicas */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{community.villages || "Sin nombre"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{community.department}</TableCell>
                  <TableCell>{community.municipality}</TableCell>
                  <TableCell>
                    {community.hamlets_count ? (
                      <span>{community.hamlets_count}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>

                  {/* Información del líder */}
                  <TableCell>
                    {community.leader_name || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {community.leader_phone || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        community.is_in_leaders_group ? "default" : "outline"
                      }
                    >
                      {community.is_in_leaders_group ? "Sí" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={community.community_committee || ""}
                  >
                    {community.community_committee || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge
                      className={
                        community.status === "activa"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : community.status === "suspendida"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }
                    >
                      {community.status === "activa"
                        ? "Activa"
                        : community.status === "suspendida"
                        ? "Suspendida"
                        : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-[150px] truncate"
                    title={community.inactive_reason || ""}
                  >
                    {community.inactive_reason || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Familias */}
                  <TableCell>
                    {community.total_families || (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {community.families_in_ra || (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>

                  {/* Demografía (14 columnas) */}
                  <TableCell>{community.early_childhood_women}</TableCell>
                  <TableCell>{community.early_childhood_men}</TableCell>
                  <TableCell>{community.childhood_3_5_women}</TableCell>
                  <TableCell>{community.childhood_3_5_men}</TableCell>
                  <TableCell>{community.youth_6_10_women}</TableCell>
                  <TableCell>{community.youth_6_10_men}</TableCell>
                  <TableCell>{community.adults_11_18_women}</TableCell>
                  <TableCell>{community.adults_11_18_men}</TableCell>
                  <TableCell>{community.adults_19_60_women}</TableCell>
                  <TableCell>{community.adults_19_60_men}</TableCell>
                  <TableCell>{community.seniors_61_plus_women}</TableCell>
                  <TableCell>{community.seniors_61_plus_men}</TableCell>
                  <TableCell>{community.pregnant_women}</TableCell>
                  <TableCell>{community.lactating_women}</TableCell>

                  {/* Otros datos */}
                  <TableCell>
                    {community.placement_type || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        community.has_whatsapp_group ? "default" : "outline"
                      }
                    >
                      {community.has_whatsapp_group ? "Sí" : "No"}
                    </Badge>
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
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="max-w-[150px] truncate"
                    title={community.storage_capacity || ""}
                  >
                    {community.storage_capacity || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="max-w-[150px] truncate"
                    title={community.placement_methods || ""}
                  >
                    {community.placement_methods || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Fechas */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(community.registration_date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(community.termination_date)}
                  </TableCell>
                  <TableCell
                    className="max-w-[150px] truncate"
                    title={community.termination_reason || ""}
                  >
                    {community.termination_reason || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Auditoría */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(community.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(community.updated_at)}
                  </TableCell>

                  {/* Acciones fijas */}
                  <TableCell className="sticky right-0 bg-white border-l shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
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
                          className="bg-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => {
                          setSelectedCommunity(community);
                          setShowViewModal(true);
                        }}
                        className="bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEdit(community)}
                        className="bg-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => setCommunityToDelete(community)}
                        className="hover:text-destructive bg-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {!loading && communities.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, total)} de {total} comunidades
          </div>

          <div className="flex items-center gap-1">
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-9"
            >
              &laquo;
            </Button>

            {/* Anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9"
            >
              &lsaquo;
            </Button>

            {/* Números de página (solo 3) */}
            <div className="flex items-center gap-1">
              {(() => {
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(totalPages, startPage + 2);

                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      className="w-9"
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}
            </div>

            {/* Siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &rsaquo;
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &raquo;
            </Button>
          </div>
        </div>
      )}

      {/* Modal para seleccionar comunidades (para Perfil Comunitario) */}
      <CommunitySelector
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={fetchCommunities}
      />

      {/* Modal CRUD para crear/editar comunidades */}
      <CommunityCrudForm
        open={showCrudForm}
        onOpenChange={(open) => {
          setShowCrudForm(open);
          if (!open) setSelectedCommunity(null);
        }}
        onSuccess={fetchCommunities}
        community={selectedCommunity}
      />

      {/* Modal de vista completa */}
      <CommunityViewModal
        open={showViewModal}
        onOpenChange={(open) => {
          setShowViewModal(open);
          if (!open) setSelectedCommunity(null);
        }}
        community={selectedCommunity}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={!!communityToDelete}
        onOpenChange={(open) => !open && setCommunityToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la comunidad{" "}
              <strong>{communityToDelete?.villages}</strong>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
