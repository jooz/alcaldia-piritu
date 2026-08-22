"use client";
import React, { useEffect, useState, useCallback } from "react";
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
} from "@mui/material";
import { IconPencil, IconTrash, IconPlus, IconUserPlus, IconUsers } from "@tabler/icons-react";
import PageContainer from "../components/container/PageContainer";
import BlankCard from "../components/shared/BlankCard";

interface AttentionArea {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  creado: string;
  visitors?: Visitor[];
}

interface Visitor {
  id: number;
  name: string;
  phone: string | null;
  active: boolean;
  creado: string;
}

const emptyAreaForm = { name: "", description: "" };
const emptyVisitorForm = { name: "", phone: "" };

const AttentionAreasPage = () => {
  // Attention Areas state
  const [areas, setAreas] = useState<AttentionArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areaOpen, setAreaOpen] = useState(false);
  const [editandoArea, setEditandoArea] = useState<AttentionArea | null>(null);
  const [areaForm, setAreaForm] = useState(emptyAreaForm);

  // Visitors state
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [vLoading, setVLoading] = useState(false);
  const [vError, setVError] = useState<string | null>(null);
  const [vOpen, setVOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [editandoVisitor, setEditandoVisitor] = useState<Visitor | null>(null);
  const [vForm, setVForm] = useState(emptyVisitorForm);

  const cargarAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attention-areas");
      if (!res.ok) throw new Error();
      setAreas(await res.json());
      setError(null);
    } catch {
      setError("No se pudieron cargar las áreas de atención");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarVisitors = useCallback(async (areaId: number) => {
    setVLoading(true);
    setVError(null);
    try {
      const res = await fetch(`/api/attention-areas/${areaId}/visitors`);
      if (!res.ok) throw new Error();
      setVisitors(await res.json());
    } catch {
      setVError("No se pudieron cargar los visitadores");
    } finally {
      setVLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAreas();
  }, [cargarAreas]);

  // Area CRUD
  const handleGuardarArea = async () => {
    setError(null);
    try {
      const res = editandoArea
        ? await fetch(`/api/attention-areas/${editandoArea.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: areaForm.name, description: areaForm.description }),
          })
        : await fetch("/api/attention-areas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(areaForm),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      setAreaOpen(false);
      setAreaForm(emptyAreaForm);
      setEditandoArea(null);
      cargarAreas();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    }
  };

  const toggleActivoArea = async (a: AttentionArea) => {
    await fetch(`/api/attention-areas/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    cargarAreas();
  };

  const eliminarArea = async (a: AttentionArea) => {
    if (!confirm(`Eliminar área "${a.name}"?`)) return;
    const res = await fetch(`/api/attention-areas/${a.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar");
    }
    cargarAreas();
  };

  const abrirNuevaArea = () => {
    setEditandoArea(null);
    setAreaForm(emptyAreaForm);
    setAreaOpen(true);
  };

  const abrirEditarArea = (a: AttentionArea) => {
    setEditandoArea(a);
    setAreaForm({ name: a.name, description: a.description || "" });
    setAreaOpen(true);
  };

  // Visitor CRUD
  const abrirVisitors = (areaId: number, areaName: string) => {
    setSelectedAreaId(areaId);
    setSelectedAreaName(areaName);
    setVOpen(true);
    cargarVisitors(areaId);
  };

  const handleGuardarVisitor = async () => {
    setVError(null);
    if (!selectedAreaId) return;
    try {
      const res = editandoVisitor
        ? await fetch(`/api/visitors/${editandoVisitor.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: vForm.name, phone: vForm.phone }),
          })
        : await fetch(`/api/attention-areas/${selectedAreaId}/visitors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: vForm.name, phone: vForm.phone }),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      setVOpen(false);
      setVForm(emptyVisitorForm);
      setEditandoVisitor(null);
      cargarVisitors(selectedAreaId);
    } catch (e: any) {
      setVError(e.message || "Error guardando");
    }
  };

  const toggleActivoVisitor = async (v: Visitor) => {
    if (!selectedAreaId) return;
    await fetch(`/api/visitors/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !v.active }),
    });
    cargarVisitors(selectedAreaId);
  };

  const eliminarVisitor = async (v: Visitor) => {
    if (!confirm(`Eliminar visitador "${v.name}"?`)) return;
    const res = await fetch(`/api/visitors/${v.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setVError(data.error || "No se pudo eliminar");
    }
    cargarVisitors(selectedAreaId!);
  };

  const abrirNuevoVisitor = () => {
    setEditandoVisitor(null);
    setVForm(emptyVisitorForm);
  };

  const abrirEditarVisitor = (v: Visitor) => {
    setEditandoVisitor(v);
    setVForm({ name: v.name, phone: v.phone || "" });
  };

  return (
    <PageContainer title="Áreas de Atención" description="Gestión de Direcciones/Departamentos y Visitadores">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>Gestionar Áreas de Atención</Typography>
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={abrirNuevaArea}>
            Nueva Área
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <BlankCard>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre del Área</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Visitadores</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : areas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin áreas de atención</TableCell>
                  </TableRow>
                ) : (
                  areas.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.id.toString().padStart(3, "0")}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.description || "-"}</TableCell>
                      <TableCell>
                        <Switch checked={a.active} onChange={() => toggleActivoArea(a)} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => abrirVisitors(a.id, a.name)}
                          size="small"
                          aria-label="Gestionar visitadores"
                        >
                          <IconUsers size={18} />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => abrirEditarArea(a)} size="small">
                          <IconPencil size={18} />
                        </IconButton>
                        <IconButton onClick={() => eliminarArea(a)} size="small" color="error">
                          <IconTrash size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </BlankCard>

        {/* Area Modal */}
        <Dialog open={areaOpen} onClose={() => setAreaOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editandoArea ? `Editar: ${editandoArea.name}` : "Nueva Área de Atención"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Nombre del Área"
                fullWidth
                value={areaForm.name}
                onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={areaForm.description}
                onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAreaOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarArea}>Guardar</Button>
          </DialogActions>
        </Dialog>

        {/* Visitors Modal */}
        <Dialog open={vOpen} onClose={() => setVOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedAreaName ? `Visitadores - ${selectedAreaName}` : "Visitadores"}
          </DialogTitle>
          <DialogContent>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Lista de Visitadores</Typography>
                <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={abrirNuevoVisitor}>
                  Nuevo Visitador
                </Button>
              </Stack>

              {vError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setVError(null)}>
                  {vError}
                </Alert>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress size={24} sx={{ my: 2 }} />
                        </TableCell>
                      </TableRow>
                    ) : visitors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">Sin visitadores</TableCell>
                      </TableRow>
                    ) : (
                      visitors.map((v) => (
                        <TableRow key={v.id} hover>
                          <TableCell>{v.id.toString().padStart(3, "0")}</TableCell>
                          <TableCell>{v.name}</TableCell>
                          <TableCell>{v.phone || "-"}</TableCell>
                          <TableCell>
                            <Switch checked={v.active} onChange={() => toggleActivoVisitor(v)} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => abrirEditarVisitor(v)} size="small">
                              <IconPencil size={18} />
                            </IconButton>
                            <IconButton onClick={() => eliminarVisitor(v)} size="small" color="error">
                              <IconTrash size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Dialog open={editandoVisitor !== null || vForm.name !== ""} onClose={() => {
                setEditandoVisitor(null);
                setVForm(emptyVisitorForm);
              }} maxWidth="sm" fullWidth>
                <DialogTitle>{editandoVisitor ? `Editar: ${editandoVisitor.name}` : "Nuevo Visitador"}</DialogTitle>
                <DialogContent>
                  <Stack spacing={2} mt={1}>
                    <TextField
                      label="Nombre del Visitador"
                      fullWidth
                      value={vForm.name}
                      onChange={(e) => setVForm({ ...vForm, name: e.target.value })}
                    />
                    <TextField
                      label="Teléfono"
                      fullWidth
                      value={vForm.phone}
                      onChange={(e) => setVForm({ ...vForm, phone: e.target.value })}
                    />
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => { setEditandoVisitor(null); setVForm(emptyVisitorForm); }}>Cancelar</Button>
                  <Button variant="contained" onClick={handleGuardarVisitor}>Guardar</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default AttentionAreasPage;