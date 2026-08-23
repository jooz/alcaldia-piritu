"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Switch,
  CircularProgress,
  TablePagination,
  Divider,
  Tooltip,
} from "@mui/material";
import { IconPencil, IconTrash, IconUser } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

interface Visitor {
  id: number;
  name: string;
  phone: string;
  active: boolean;
  creado: string;
}

interface AttentionArea {
  id: number;
  name: string;
  description: string;
  cedula: string;
  responsable: string;
  telefono: string;
  active: boolean;
  creado: string;
  visitors?: Visitor[];
}

const emptyAreaForm = {
  name: "",
  description: "",
  cedula: "",
  responsable: "",
  telefono: "",
};

const emptyVisitorForm = {
  name: "",
  phone: "",
};

const AttentionAreasPage = () => {
  const [areas, setAreas] = useState<AttentionArea[]>([]);
  const [areaForm, setAreaForm] = useState(emptyAreaForm);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [visitorDialogOpen, setVisitorDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AttentionArea | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visitorForm, setVisitorForm] = useState(emptyVisitorForm);
  const [editingVisitorId, setEditingVisitorId] = useState<number | null>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const cargarAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/attention-areas");
      if (!res.ok) throw new Error("Error al cargar áreas");
      const data = await res.json();
      setAreas(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar áreas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  const handleGuardarArea = async () => {
    if (
      !areaForm.name.trim() ||
      !areaForm.description.trim() ||
      !areaForm.cedula.trim() ||
      !areaForm.responsable.trim() ||
      !areaForm.telefono.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const url = editingAreaId
        ? `/api/attention-areas/${editingAreaId}`
        : "/api/attention-areas";
      const method = editingAreaId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(areaForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al guardar área");
      }

      setSuccess(editingAreaId ? "Área actualizada correctamente." : "Área creada correctamente.");
      setAreaForm(emptyAreaForm);
      setEditingAreaId(null);
      cargarAreas();
    } catch (err: any) {
      setError(err.message || "Error al guardar área");
    } finally {
      setLoading(false);
    }
  };

  const editarArea = (area: AttentionArea) => {
    setAreaForm({
      name: area.name,
      description: area.description,
      cedula: area.cedula,
      responsable: area.responsable,
      telefono: area.telefono,
    });
    setEditingAreaId(area.id);
  };

  const eliminarArea = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta área?")) return;

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const res = await fetch(`/api/attention-areas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar área");
      }

      setSuccess("Área eliminada correctamente.");
      cargarAreas();
    } catch (err: any) {
      setError(err.message || "Error al eliminar área");
    } finally {
      setLoading(false);
    }
  };

  const toggleActivoArea = async (area: AttentionArea) => {
    try {
      setError(null);
      const res = await fetch(`/api/attention-areas/${area.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !area.active }),
      });

      if (!res.ok) throw new Error("Error al cambiar estado del área");
      cargarAreas();
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado del área");
    }
  };

  const abrirVisitors = async (area: AttentionArea) => {
    setSelectedArea(area);
    setVisitorDialogOpen(true);
    setVisitorForm(emptyVisitorForm);
    setEditingVisitorId(null);
    await cargarVisitors(area.id);
  };

  const cargarVisitors = async (areaId: number) => {
    try {
      setLoadingVisitors(true);
      const res = await fetch(`/api/attention-areas/${areaId}/visitors`);
      if (!res.ok) throw new Error("Error al cargar visitadores");
      const data = await res.json();
      setVisitors(data);
    } catch {
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  };

  const handleGuardarVisitor = async () => {
    if (!selectedArea) return;
    if (!visitorForm.name.trim()) {
      setError("El nombre del visitador es obligatorio.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      let res: Response;

      if (editingVisitorId) {
        res = await fetch(`/api/visitors/${editingVisitorId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitorForm),
        });
      } else {
        res = await fetch(`/api/attention-areas/${selectedArea.id}/visitors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitorForm),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al guardar visitador");
      }

      setVisitorForm(emptyVisitorForm);
      setEditingVisitorId(null);
      cargarVisitors(selectedArea.id);
    } catch (err: any) {
      setError(err.message || "Error al guardar visitador");
    }
  };

  const editarVisitor = (visitor: Visitor) => {
    setVisitorForm({ name: visitor.name, phone: visitor.phone });
    setEditingVisitorId(visitor.id);
  };

  const eliminarVisitor = async (visitorId: number) => {
    if (!confirm("¿Está seguro de eliminar este visitador?")) return;

    try {
      setError(null);
      const res = await fetch(`/api/visitors/${visitorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar visitador");
      }

      if (selectedArea) cargarVisitors(selectedArea.id);
    } catch (err: any) {
      setError(err.message || "Error al eliminar visitador");
    }
  };

  const toggleActivoVisitor = async (visitor: Visitor) => {
    try {
      setError(null);
      const res = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !visitor.active }),
      });

      if (!res.ok) throw new Error("Error al cambiar estado del visitador");
      if (selectedArea) cargarVisitors(selectedArea.id);
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado del visitador");
    }
  };

  const areasPaginadas = areas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <PageContainer title="Gestionar Áreas de Atención" description="Administrar áreas de atención y sus visitadores">
      <Box>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <BlankCard>
          <Box sx={{ p: 3, bgcolor: "grey.50", border: 1, borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Gestionar Áreas de Atención.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Nombre del Departamento"
                value={areaForm.name}
                onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                required
                placeholder="ej. Dirección de Bienestar Social"
                fullWidth
              />
              <TextField
                label="Función Principal del área de atención"
                value={areaForm.description}
                onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                required
                multiline
                placeholder="Detalle las funciones y alcance del área"
                fullWidth
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Datos del Responsable
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Cédula del Responsable"
                value={areaForm.cedula}
                onChange={(e) => setAreaForm({ ...areaForm, cedula: e.target.value })}
                required
                placeholder="ej. 15141471"
                fullWidth
              />
              <TextField
                label="Nombre del Responsable"
                value={areaForm.responsable}
                onChange={(e) => setAreaForm({ ...areaForm, responsable: e.target.value })}
                required
                placeholder="ej. Ester Romero"
                fullWidth
              />
              <TextField
                label="Teléfono del Responsable"
                value={areaForm.telefono}
                onChange={(e) => setAreaForm({ ...areaForm, telefono: e.target.value })}
                required
                placeholder="ej. 04126714388"
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="inherit"
                sx={{ bgcolor: "grey.100" }}
                onClick={() => {
                  setAreaForm(emptyAreaForm);
                  setEditingAreaId(null);
                }}
              >
                Limpiar
              </Button>
              <Button variant="contained" color="warning" onClick={handleGuardarArea} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Guardar"}
              </Button>
            </Stack>
          </Box>
        </BlankCard>

        <BlankCard>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre Departamento</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Función Principal</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : areasPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay áreas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  areasPaginadas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>{area.id}</TableCell>
                      <TableCell>{area.name}</TableCell>
                      <TableCell>{area.responsable}</TableCell>
                      <TableCell>{area.telefono}</TableCell>
                      <TableCell>{area.description}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Tooltip title={area.active ? "Desactivar" : "Activar"}>
                            <Switch
                              checked={area.active}
                              color="success"
                              onChange={() => toggleActivoArea(area)}
                            />
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="default" size="small" onClick={() => editarArea(area)}>
                              <IconPencil size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Asociar Visitadores">
                            <IconButton color="primary" size="small" onClick={() => abrirVisitors(area)}>
                              <IconUser size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={() => eliminarArea(area.id)}>
                              <IconTrash size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={areas.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </BlankCard>

        <Dialog
          open={visitorDialogOpen}
          onClose={() => setVisitorDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Visitadores — {selectedArea?.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Nombre"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Teléfono"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ bgcolor: "grey.100" }}
                  onClick={() => {
                    setVisitorForm(emptyVisitorForm);
                    setEditingVisitorId(null);
                  }}
                >
                  Limpiar
                </Button>
                <Button variant="contained" color="warning" onClick={handleGuardarVisitor}>
                  Guardar
                </Button>
              </Stack>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingVisitors ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : visitors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay visitadores registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell>{visitor.id}</TableCell>
                          <TableCell>{visitor.name}</TableCell>
                          <TableCell>{visitor.phone}</TableCell>
                          <TableCell>
                            <Switch
                              checked={visitor.active}
                              color="success"
                              size="small"
                              onChange={() => toggleActivoVisitor(visitor)}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => editarVisitor(visitor)}>
                                  <IconPencil size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton color="error" size="small" onClick={() => eliminarVisitor(visitor.id)}>
                                  <IconTrash size={16} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVisitorDialogOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default AttentionAreasPage;
