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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import PageContainer from "../components/container/PageContainer";
import BlankCard from "../components/shared/BlankCard";

interface Requirement {
  id: number;
  name: string;
  condition: string;
  requiresValidity: boolean;
  validityDays: number;
  mandatory: boolean;
  active: boolean;
  creado: string;
}

const emptyForm = {
  name: "",
  condition: "",
  requiresValidity: false,
  validityDays: 0,
  mandatory: true,
};

const RequirementsPage = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Requirement | null>(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requirements");
      if (!res.ok) throw new Error();
      setRequirements(await res.json());
      setError(null);
    } catch {
      setError("No se pudieron cargar los recaudos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleGuardar = async () => {
    setError(null);
    try {
      const res = editando
        ? await fetch(`/api/requirements/${editando.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/requirements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      setOpen(false);
      setForm(emptyForm);
      setEditando(null);
      cargar();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    }
  };

  const toggleActivo = async (r: Requirement) => {
    await fetch(`/api/requirements/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active }),
    });
    cargar();
  };

  const eliminar = async (r: Requirement) => {
    if (!confirm(`Eliminar recaudo "${r.name}"?`)) return;
    const res = await fetch(`/api/requirements/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar");
    }
    cargar();
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const abrirEditar = (r: Requirement) => {
    setEditando(r);
    setForm({
      name: r.name,
      condition: r.condition,
      requiresValidity: r.requiresValidity,
      validityDays: r.validityDays,
      mandatory: r.mandatory,
    });
    setOpen(true);
  };

  return (
    <PageContainer title="Recaudos" description="Gestión de la lista general de recaudos">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>Gestionar Recaudos</Typography>
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={abrirNuevo}>
            Nuevo Recaudo
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
                  <TableCell>Nombre Recaudo</TableCell>
                  <TableCell>Obligatorio</TableCell>
                  <TableCell>Condición del Recaudo</TableCell>
                  <TableCell>Estado</TableCell>
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
                ) : requirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin recaudos</TableCell>
                  </TableRow>
                ) : (
                  requirements.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.id.toString().padStart(3, "0")}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.mandatory ? "Si" : "No"}</TableCell>
                      <TableCell>{r.condition}</TableCell>
                      <TableCell>
                        <Switch checked={r.active} onChange={() => toggleActivo(r)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => abrirEditar(r)} size="small">
                          <IconPencil size={18} />
                        </IconButton>
                        <IconButton onClick={() => eliminar(r)} size="small" color="error">
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

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editando ? `Editar Recaudo: ${editando.name}` : "Nuevo Recaudo"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Nombre del Recaudo"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <TextField
                  label="Condición del Recaudo"
                  fullWidth
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl fullWidth>
                  <InputLabel>Requiere Periodo de Vigencia</InputLabel>
                  <Select
                    label="Requiere Periodo de Vigencia"
                    value={form.requiresValidity ? "Si" : "No"}
                    onChange={(e) => setForm({ ...form, requiresValidity: e.target.value === "Si" })}
                  >
                    <MenuItem value="Si">Si</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Tiempo (días)"
                  type="number"
                  fullWidth
                  disabled={!form.requiresValidity}
                  value={form.validityDays}
                  onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) || 0 })}
                />
                <FormControl fullWidth>
                  <InputLabel>Obligatorio</InputLabel>
                  <Select
                    label="Obligatorio"
                    value={form.mandatory ? "Si" : "No"}
                    onChange={(e) => setForm({ ...form, mandatory: e.target.value === "Si" })}
                  >
                    <MenuItem value="Si">Si</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default RequirementsPage;