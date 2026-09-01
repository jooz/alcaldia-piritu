"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type {
  TipoInstitucion,
  CentroMedico,
  TipoAyudaTecnica,
  ClasificacionEtaria,
  CondicionMovilidad,
  AyudaTecnicaRow,
} from "./types";

interface SaludTecnicaProps {
  form: any;
  setForm: (f: any) => void;
  tiposInstitucion: TipoInstitucion[];
  centrosMedicos: CentroMedico[];
  tiposAyudaTecnica: TipoAyudaTecnica[];
  clasificacionesEtarias: ClasificacionEtaria[];
  condicionesMovilidad: CondicionMovilidad[];
}

const SaludTecnica = ({
  form,
  setForm,
  tiposInstitucion,
  centrosMedicos,
  tiposAyudaTecnica,
  clasificacionesEtarias,
  condicionesMovilidad,
}: SaludTecnicaProps) => {
  const [nuevaAyuda, setNuevaAyuda] = useState({
    tipoAyudaTecnicaId: 0,
    clasificacionEtariaId: 0,
    peso: "",
    condicionMovilidadId: 0,
  });

  const centrosFiltrados = centrosMedicos.filter(
    (c) => c.tipo_institucion_id === form.salud_tipo_institucion_id
  );

  const handleAgregar = () => {
    if (
      !nuevaAyuda.tipoAyudaTecnicaId ||
      !nuevaAyuda.clasificacionEtariaId ||
      !nuevaAyuda.peso.trim() ||
      !nuevaAyuda.condicionMovilidadId
    )
      return;

    const tipo = tiposAyudaTecnica.find((t) => t.id === nuevaAyuda.tipoAyudaTecnicaId);
    const clasif = clasificacionesEtarias.find((c) => c.id === nuevaAyuda.clasificacionEtariaId);
    const condicion = condicionesMovilidad.find((c) => c.id === nuevaAyuda.condicionMovilidadId);

    if (!tipo || !clasif || !condicion) return;

    const newRow: AyudaTecnicaRow = {
      tipoAyudaTecnicaId: nuevaAyuda.tipoAyudaTecnicaId,
      tipoAyudaTecnicaNombre: tipo.nombre,
      clasificacionEtariaId: nuevaAyuda.clasificacionEtariaId,
      clasificacionEtariaNombre: clasif.nombre,
      peso: nuevaAyuda.peso,
      condicionMovilidadId: nuevaAyuda.condicionMovilidadId,
      condicionMovilidadNombre: condicion.nombre,
    };

    setForm({
      ...form,
      salud_ayudas_tecnicas: [...form.salud_ayudas_tecnicas, newRow],
    });
    setNuevaAyuda({ tipoAyudaTecnicaId: 0, clasificacionEtariaId: 0, peso: "", condicionMovilidadId: 0 });
  };

  const handleEliminar = (index: number) => {
    setForm({
      ...form,
      salud_ayudas_tecnicas: form.salud_ayudas_tecnicas.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <Box
      p={2}
      sx={{
        bgcolor: "error.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "error.200",
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} color="error.main">
        Datos Específicos: Salud y Bienestar - Ayudas Técnicas
      </Typography>

      {/* Diagnóstico */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Diagnóstico médico / Patología"
            fullWidth
            required
            multiline
            rows={2}
            value={form.salud_diagnostico}
            onChange={(e) => setForm({ ...form, salud_diagnostico: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Institución de Salud"
            fullWidth
            required
            select
            value={form.salud_tipo_institucion_id || ""}
            onChange={(e) =>
              setForm({ ...form, salud_tipo_institucion_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {tiposInstitucion.map((ti) => (
              <MenuItem key={ti.id} value={ti.id}>
                {ti.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Centro Médico"
            fullWidth
            required
            select
            value={form.salud_institucion_id || ""}
            onChange={(e) =>
              setForm({ ...form, salud_institucion_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {centrosFiltrados.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Fila de agregación */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Agregar Ayuda Técnica
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Tipo de Ayuda Técnica"
            fullWidth
            select
            size="small"
            value={nuevaAyuda.tipoAyudaTecnicaId}
            onChange={(e) =>
              setNuevaAyuda({ ...nuevaAyuda, tipoAyudaTecnicaId: Number(e.target.value) })
            }
          >
            <MenuItem value={0}>
              <em>Seleccione</em>
            </MenuItem>
            {tiposAyudaTecnica.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label="Clasificación Etaria"
            fullWidth
            select
            size="small"
            value={nuevaAyuda.clasificacionEtariaId}
            onChange={(e) =>
              setNuevaAyuda({ ...nuevaAyuda, clasificacionEtariaId: Number(e.target.value) })
            }
          >
            <MenuItem value={0}>
              <em>Seleccione</em>
            </MenuItem>
            {clasificacionesEtarias.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label="Peso (Kg)"
            fullWidth
            size="small"
            inputMode="numeric"
            value={nuevaAyuda.peso}
            onChange={(e) => setNuevaAyuda({ ...nuevaAyuda, peso: e.target.value.replace(/\D/g, "") })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Condición de Movilidad"
            fullWidth
            select
            size="small"
            value={nuevaAyuda.condicionMovilidadId}
            onChange={(e) =>
              setNuevaAyuda({ ...nuevaAyuda, condicionMovilidadId: Number(e.target.value) })
            }
          >
            <MenuItem value={0}>
              <em>Seleccione</em>
            </MenuItem>
            {condicionesMovilidad.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <Button
            variant="contained"
            startIcon={<IconPlus size={16} />}
            onClick={handleAgregar}
            disabled={
              !nuevaAyuda.tipoAyudaTecnicaId ||
              !nuevaAyuda.clasificacionEtariaId ||
              !nuevaAyuda.peso.trim() ||
              !nuevaAyuda.condicionMovilidadId
            }
            fullWidth
          >
            Agregar
          </Button>
        </Grid>
      </Grid>

      {/* Tabla dinámica */}
      {form.salud_ayudas_tecnicas.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 700 }}>Tipo de Ayuda Técnica</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Clasificación Etaria</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Peso (Kg)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Condición de Movilidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.salud_ayudas_tecnicas.map((row: AyudaTecnicaRow, index: number) => (
                <TableRow key={index}>
                  <TableCell>{row.tipoAyudaTecnicaNombre}</TableCell>
                  <TableCell>{row.clasificacionEtariaNombre}</TableCell>
                  <TableCell>{row.peso}</TableCell>
                  <TableCell>{row.condicionMovilidadNombre}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleEliminar(index)}>
                      <IconTrash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SaludTecnica;
