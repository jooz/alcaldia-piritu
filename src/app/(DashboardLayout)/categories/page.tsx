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

interface HelpType {
  id: number;
  name: string;
  active: boolean;
  creado: string;
}

const emptyCategoryForm = { name: "", description: "" };
const emptyHelpTypeForm = { name: "" };

const CategoriesPage = () => {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [editandoCat, setEditandoCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState(emptyCategoryForm);

  // Help Types state
  const [helpTypes, setHelpTypes] = useState<HelpType[]>([]);
  const [htLoading, setHtLoading] = useState(false);
  const [htError, setHtError] = useState<string | null>(null);
  const [htOpen, setHtOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [editandoHt, setEditandoHt] = useState<HelpType | null>(null);
  const [htForm, setHtForm] = useState(emptyHelpTypeForm);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  // Category CRUD
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

  // Help Type CRUD
  const abrirHelpTypes = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setHtOpen(true);
    cargarHelpTypes(categoryId);
  };

  const handleGuardarHelpType = async () => {
    setHtError(null);
    if (!selectedCategoryId) return;
    try {
      const res = editandoHt
        ? await fetch(`/api/help-types/${editandoHt.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: htForm.name }),
          })
        : await fetch(`/api/categories/${selectedCategoryId}/help-types`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: htForm.name }),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      setHtOpen(false);
      setHtForm(emptyHelpTypeForm);
      setEditandoHt(null);
      cargarHelpTypes(selectedCategoryId);
    } catch (e: any) {
      setHtError(e.message || "Error guardando");
    }
  };

  const toggleActivoHt = async (ht: HelpType) => {
    if (!selectedCategoryId) return;
    await fetch(`/api/help-types/${ht.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ht.active }),
    });
    cargarHelpTypes(selectedCategoryId);
  };

  const eliminarHelpType = async (ht: HelpType) => {
    if (!confirm(`Eliminar tipo de ayuda "${ht.name}"?`)) return;
    const res = await fetch(`/api/help-types/${ht.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setHtError(data.error || "No se pudo eliminar");
    }
    cargarHelpTypes(selectedCategoryId!);
  };

  const abrirNuevoHelpType = () => {
    setEditandoHt(null);
    setHtForm(emptyHelpTypeForm);
  };

  const abrirEditarHelpType = (ht: HelpType) => {
    setEditandoHt(ht);
    setHtForm({ name: ht.name });
  };

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
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin categorías</TableCell>
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
          <DialogTitle>
            {selectedCategoryName ? `Tipos de Ayuda - ${selectedCategoryName}` : "Tipos de Ayuda"}
          </DialogTitle>
          <DialogContent>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Lista de Tipos de Ayuda</Typography>
                <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={abrirNuevoHelpType}>
                  Nuevo Tipo
                </Button>
              </Stack>

              {htError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setHtError(null)}>
                  {htError}
                </Alert>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre Tipo de Ayuda</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {htLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress size={24} sx={{ my: 2 }} />
                        </TableCell>
                      </TableRow>
                    ) : helpTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Sin tipos de ayuda</TableCell>
                      </TableRow>
                    ) : (
                      helpTypes.map((ht) => (
                        <TableRow key={ht.id} hover>
                          <TableCell>{ht.id.toString().padStart(3, "0")}</TableCell>
                          <TableCell>{ht.name}</TableCell>
                          <TableCell>
                            <Switch checked={ht.active} onChange={() => toggleActivoHt(ht)} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => abrirEditarHelpType(ht)} size="small">
                              <IconPencil size={18} />
                            </IconButton>
                            <IconButton onClick={() => eliminarHelpType(ht)} size="small" color="error">
                              <IconTrash size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Separator for the nested form */}
              <Box sx={{ my: 4, borderTop: '1px solid', borderColor: 'divider' }} />

              {/* help-type-form nested inside the same modal for a cleaner "Single Modal" experience */}
              {(editandoHt !== null || htForm.name !== "") && (
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    {editandoHt ? `Editar: ${editandoHt.name}` : "Nuevo Tipo de Ayuda"}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Nombre del Tipo de Ayuda"
                      fullWidth
                      value={htForm.name}
                      onChange={(e) => setHtForm({ ...htForm, name: e.target.value })}
                      autoFocus
                    />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button onClick={() => { setEditandoHt(null); setHtForm(emptyHelpTypeForm); }}>
                        Cancelar
                      </Button>
                      <Button variant="contained" onClick={handleGuardarHelpType}>
                        Guardar
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default CategoriesPage;