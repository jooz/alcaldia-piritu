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
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { IconPencil, IconTrash, IconPlus, IconSettings, IconCheck, IconX } from "@tabler/icons-react";
import PageContainer from "../components/container/PageContainer";
import BlankCard from "../components/shared/BlankCard";

interface HelpType {
  id: number;
  name: string;
  active: boolean;
  categoryId: number;
  category?: { name: string };
  requirements?: HelpRequirement[];
}

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

interface HelpRequirement {
  id: number;
  helpTypeId: number;
  requirementId: number;
  requirement: Requirement;
}

interface Category {
  id: number;
  name: string;
}

const HelpRequirementsPage = () => {
  // Categories for filter
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Help Types
  const [helpTypes, setHelpTypes] = useState<HelpType[]>([]);
  const [htLoading, setHtLoading] = useState(false);

  // All Requirements
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [reqLoading, setReqLoading] = useState(true);

  // Selected Help Type for requirements assignment
  const [selectedHelpType, setSelectedHelpType] = useState<HelpType | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<number[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const cargarCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch {
      console.error("Error loading categories");
    }
  }, [selectedCategoryId]);

  const cargarHelpTypes = useCallback(async (categoryId: number) => {
    setHtLoading(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}/help-types`);
      if (!res.ok) throw new Error();
      setHelpTypes(await res.json());
    } catch {
      console.error("Error loading help types");
    } finally {
      setHtLoading(false);
    }
  }, []);

  const cargarRequirements = useCallback(async () => {
    setReqLoading(true);
    try {
      const res = await fetch("/api/requirements");
      if (!res.ok) throw new Error();
      setRequirements(await res.json());
    } catch {
      console.error("Error loading requirements");
    } finally {
      setReqLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCategories();
    cargarRequirements();
  }, [cargarCategories, cargarRequirements]);

  useEffect(() => {
    if (selectedCategoryId) {
      cargarHelpTypes(selectedCategoryId);
    }
  }, [selectedCategoryId, cargarHelpTypes]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string | number } }) => {
    const value = event.target?.value;
    const id = typeof value === "string" ? Number(value) : value;
    setSelectedCategoryId(id);
  };

  const abrirAsignarRecaudos = (ht: HelpType) => {
    setSelectedHelpType(ht);
    const currentReqIds = ht.requirements?.map(r => r.requirementId) || [];
    setSelectedRequirements(currentReqIds);
    setAssignOpen(true);
  };

  const toggleRequirement = (reqId: number) => {
    setSelectedRequirements(prev => 
      prev.includes(reqId) 
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const handleGuardarAsignacion = async () => {
    if (!selectedHelpType) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await fetch(`/api/help-types/${selectedHelpType.id}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementIds: selectedRequirements }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      // Refresh help types to show updated requirements
      if (selectedCategoryId) {
        cargarHelpTypes(selectedCategoryId);
      }
      setAssignOpen(false);
      setSelectedHelpType(null);
    } catch (e: any) {
      setAssignError(e.message || "Error guardando");
    } finally {
      setAssignLoading(false);
    }
  };

  const getSelectedRequirementsNames = () => {
    return requirements
      .filter(r => selectedRequirements.includes(r.id))
      .map(r => r.name)
      .join(", ");
  };

  return (
    <PageContainer title="Configuración de Recaudos" description="Asignar recaudos obligatorios por Tipo de Ayuda">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
          <Typography variant="h4" fontWeight={700}>Configurar Recaudos por Tipo de Ayuda</Typography>
          
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel id="category-label">Filtrar por Categoría</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategoryId || ""}
              label="Filtrar por Categoría"
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Help Types Table */}
        <BlankCard>
          <Typography variant="h6" gutterBottom>Tipos de Ayuda Disponibles</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Tipo de Ayuda</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Recaudos Asignados</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {htLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : helpTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin tipos de ayuda en esta categoría</TableCell>
                  </TableRow>
                ) : (
                  helpTypes.map((ht) => (
                    <TableRow key={ht.id} hover>
                      <TableCell>{ht.id.toString().padStart(3, "0")}</TableCell>
                      <TableCell>{ht.category?.name || ht.categoryId}</TableCell>
                      <TableCell>{ht.name}</TableCell>
                      <TableCell>
                        <Switch checked={ht.active} onChange={() => {}} size="small" disabled />
                      </TableCell>
                      <TableCell>
                        {ht.requirements && ht.requirements.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {ht.requirements.map((hr) => (
                              <Box key={hr.requirementId} sx={{ 
                                bgcolor: hr.requirement.active ? "success.light" : "grey.200",
                                color: hr.requirement.active ? "success.dark" : "grey.600",
                                px: 1, py: 0.5, borderRadius: 1, fontSize: "0.75rem"
                              }}>
                                {hr.requirement.name}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="text.secondary" variant="body2">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => abrirAsignarRecaudos(ht)} 
                          size="small"
                          aria-label="Asignar recaudos"
                        >
                          <IconSettings size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </BlankCard>

        {/* Requirements Assignment Modal */}
        <Dialog open={assignOpen} onClose={() => { setAssignOpen(false); setSelectedHelpType(null); }} maxWidth="lg" fullWidth>
          <DialogTitle>
            {selectedHelpType ? `Asignar Recaudos - ${selectedHelpType.name}` : "Asignar Recaudos"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {assignError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAssignError(null)}>
                  {assignError}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seleccione los recaudos obligatorios para este tipo de ayuda. Los recaudos inactivos no se mostrarán en formularios.
              </Typography>

              <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: 50 }}>✓</TableCell>
                      <TableCell>Nombre del Recaudo</TableCell>
                      <TableCell>Condición</TableCell>
                      <TableCell>Vigencia</TableCell>
                      <TableCell>Obligatorio</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reqLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress size={24} sx={{ my: 2 }} />
                        </TableCell>
                      </TableRow>
                    ) : requirements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Sin recaudos disponibles</TableCell>
                      </TableRow>
                    ) : (
                      requirements
                        .filter(r => r.active)
                        .map((req) => {
                          const isSelected = selectedRequirements.includes(req.id);
                          return (
                            <TableRow key={req.id} hover selected={isSelected} onClick={() => toggleRequirement(req.id)}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleRequirement(req.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {isSelected ? <IconCheck size={20} color="success" /> : <IconX size={20} color="grey" />}
                                  <Typography variant="body1">{req.name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{req.condition}</TableCell>
                              <TableCell>
                                {req.requiresValidity ? `${req.validityDays} días` : "Sin vigencia"}
                              </TableCell>
                              <TableCell>{req.mandatory ? "Sí" : "No"}</TableCell>
                              <TableCell>
                                <Switch checked={req.active} onChange={() => {}} size="small" disabled />
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedRequirements.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                  <Typography variant="body2" color="info.dark" gutterBottom>
                    <strong>Recaudos seleccionados ({selectedRequirements.length}):</strong> {getSelectedRequirementsNames()}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setAssignOpen(false); setSelectedHelpType(null); }}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarAsignacion} disabled={assignLoading}>
              {assignLoading ? <CircularProgress size={18} color="inherit" /> : "Guardar Asignación"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default HelpRequirementsPage;