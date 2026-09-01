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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { IconPencil, IconTrash, IconPlus, IconSettings } from "@tabler/icons-react";
import PageContainer from "../components/container/PageContainer";
import BlankCard from "../components/shared/BlankCard";
import Tooltip from "@mui/material/Tooltip";

interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  creado: string;
}

interface Requirement {
  id: number;
  name: string;
  condition: string;
  active: boolean;
}

interface TipoAyuda {
  id: number;
  name: string;
  categoryId: number;
  requirements: { requirement: Requirement }[];
}

const emptyCategoryForm = { name: "", description: "" };

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [editandoCat, setEditandoCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState(emptyCategoryForm);

  const [helpTypes, setHelpTypes] = useState<TipoAyuda[]>([]);
  const [htLoading, setHtLoading] = useState(false);
  const [htError, setHtError] = useState<string | null>(null);
  const [htOpen, setHtOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [editandoHt, setEditandoHt] = useState<TipoAyuda | null>(null);
  const [htName, setHtName] = useState("");
  const [htRequirements, setHtRequirements] = useState<number[]>([]);

  const [allRequirements, setAllRequirements] = useState<Requirement[]>([]);

  const [htPage, setHtPage] = useState(0);
  const [htRowsPerPage, setHtRowsPerPage] = useState(5);

  const cargarCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error();
      setCategories(await res.json());
      setError(null);
    } catch {
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarHelpTypes = useCallback(async (categoryId: number) => {
    setHtLoading(true);
    setHtError(null);
    try {
      const res = await fetch(`/api/categories/${categoryId}/help-types`);
      if (!res.ok) throw new Error();
      setHelpTypes(await res.json());
    } catch {
      setHtError("No se pudieron cargar los tipos de ayuda");
    } finally {
      setHtLoading(false);
    }
  }, []);

  const cargarRequirements = useCallback(async () => {
    try {
      const res = await fetch("/api/requirements");
      if (!res.ok) throw new Error();
      setAllRequirements(await res.json());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const handleGuardarCategoria = async () => {
    setError(null);
    try {
      const res = editandoCat
        ? await fetch(`/api/categories/${editandoCat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: catForm.name, description: catForm.description }),
          })
        : await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(catForm),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      setCatOpen(false);
      setCatForm(emptyCategoryForm);
      setEditandoCat(null);
      cargarCategorias();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    }
  };

  const toggleActivoCat = async (c: Category) => {
    await fetch(`/api/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    cargarCategorias();
  };

  const eliminarCategoria = async (c: Category) => {
    if (!confirm(`Eliminar categoría "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar");
    }
    cargarCategorias();
  };

  const abrirNuevaCategoria = () => {
    setEditandoCat(null);
    setCatForm(emptyCategoryForm);
    setCatOpen(true);
  };

  const abrirEditarCategoria = (c: Category) => {
    setEditandoCat(c);
    setCatForm({ name: c.name, description: c.description });
    setCatOpen(true);
  };

  const abrirHelpTypes = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setEditandoHt(null);
    setHtName("");
    setHtRequirements([]);
    setHtPage(0);
    setHtOpen(true);
    cargarHelpTypes(categoryId);
    cargarRequirements();
  };

  const handleGuardarHelpType = async () => {
    setHtError(null);
    if (!selectedCategoryId) return;
    if (!htName.trim()) {
      setHtError("El nombre es obligatorio");
      return;
    }
    try {
      let helpTypeId: number;

      if (editandoHt) {
        const res = await fetch(`/api/help-types/${editandoHt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: htName }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error guardando");
        }
        helpTypeId = editandoHt.id;
      } else {
        const res = await fetch(`/api/categories/${selectedCategoryId}/help-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: htName }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error guardando");
        }
        const created = await res.json();
        helpTypeId = created.id;
      }

      await fetch(`/api/help-types/${helpTypeId}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementIds: htRequirements }),
      });

      setEditandoHt(null);
      setHtName("");
      setHtRequirements([]);
      cargarHelpTypes(selectedCategoryId);
    } catch (e: any) {
      setHtError(e.message || "Error guardando");
    }
  };

  const eliminarHelpType = async (ht: TipoAyuda) => {
    if (!selectedCategoryId) return;
    if (!confirm(`Eliminar tipo de ayuda "${ht.name}"?`)) return;
    const res = await fetch(`/api/help-types/${ht.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setHtError(data.error || "No se pudo eliminar");
      return;
    }
    cargarHelpTypes(selectedCategoryId);
  };

  const abrirEditarHelpType = (ht: TipoAyuda) => {
    setEditandoHt(ht);
    setHtName(ht.name);
    setHtRequirements(ht.requirements.map((r) => r.requirement.id));
  };

  const limpiarFormularioHt = () => {
    setEditandoHt(null);
    setHtName("");
    setHtRequirements([]);
  };

  const toggleRequirement = (reqId: number) => {
    setHtRequirements((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  const htPaginated = helpTypes.slice(
    htPage * htRowsPerPage,
    htPage * htRowsPerPage + htRowsPerPage
  );

  return (
    <PageContainer title="Categorías" description="Gestión de categorías macro de solicitudes">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>Gestionar Categorías</Typography>
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={abrirNuevaCategoria}>
            Nueva Categoría
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
                  <TableCell>Nombre Categoría</TableCell>
                  <TableCell>Descripción de la Categoría</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Sin categorías</TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.id.toString().padStart(3, "0")}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.description}</TableCell>
                      <TableCell>
                        <Switch checked={c.active} onChange={() => toggleActivoCat(c)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gestionar tipos de ayuda">
                          <IconButton
                            onClick={() => abrirHelpTypes(c.id, c.name)}
                            size="small"
                            aria-label="Gestionar tipos de ayuda"
                          >
                            <IconSettings size={18} />
                          </IconButton>
                        </Tooltip>
                        <IconButton onClick={() => abrirEditarCategoria(c)} size="small">
                          <IconPencil size={18} />
                        </IconButton>
                        <IconButton onClick={() => eliminarCategoria(c)} size="small" color="error">
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

        {/* Category Modal */}
        <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editandoCat ? `Editar: ${editandoCat.name}` : "Nueva Categoría"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Nombre de la Categoría"
                fullWidth
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCatOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarCategoria}>Guardar</Button>
          </DialogActions>
        </Dialog>

        {/* Help Types Modal */}
        <Dialog open={htOpen} onClose={() => setHtOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle fontWeight={700}>
            Gestionar Tipo de Ayuda - {selectedCategoryName}
          </DialogTitle>
          <DialogContent>
            <Box>
              {htError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setHtError(null)}>
                  {htError}
                </Alert>
              )}

              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                  mb: 3,
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    label="Nombre tipo de ayuda"
                    fullWidth
                    required
                    value={htName}
                    onChange={(e) => setHtName(e.target.value)}
                    size="small"
                  />

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Recaudos
                    </Typography>
                    <FormGroup row>
                      {allRequirements.filter((r) => r.active).map((req) => (
                        <FormControlLabel
                          key={req.id}
                          control={
                            <Checkbox
                              checked={htRequirements.includes(req.id)}
                              onChange={() => toggleRequirement(req.id)}
                              size="small"
                            />
                          }
                          label={req.name}
                        />
                      ))}
                      {allRequirements.filter((r) => r.active).length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No hay recaudos disponibles
                        </Typography>
                      )}
                    </FormGroup>
                  </Box>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={limpiarFormularioHt}
                    >
                      Limpiar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGuardarHelpType}
                    >
                      Guardar
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre tipo de ayuda</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {htLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <CircularProgress size={24} sx={{ my: 2 }} />
                        </TableCell>
                      </TableRow>
                    ) : helpTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          Sin tipos de ayuda registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      htPaginated.map((ht) => (
                        <TableRow key={ht.id} hover>
                          <TableCell>{ht.id.toString().padStart(3, "0")}</TableCell>
                          <TableCell>{ht.name}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Editar">
                                <IconButton onClick={() => abrirEditarHelpType(ht)} size="small">
                                  <IconPencil size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => eliminarHelpType(ht)}
                                  size="small"
                                  color="error"
                                >
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

              <TablePagination
                component="div"
                count={helpTypes.length}
                page={htPage}
                onPageChange={(_, newPage) => setHtPage(newPage)}
                rowsPerPage={htRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setHtRowsPerPage(parseInt(e.target.value, 10));
                  setHtPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setHtOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default CategoriesPage;
