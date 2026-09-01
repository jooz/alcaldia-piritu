"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  Municipio,
  Parroquia,
  TipoInstitucion,
  Institucion,
  Uniforme,
  UniformeRow,
} from "./types";

interface EducacionProps {
  form: any;
  setForm: (f: any) => void;
  municipios: Municipio[];
  parroquias: Parroquia[];
  tiposInstitucion: TipoInstitucion[];
  instituciones: Institucion[];
  uniformes: Uniforme[];
  municipioDefault: number | null;
}

const Educacion = ({
  form,
  setForm,
  municipios,
  parroquias,
  tiposInstitucion,
  instituciones,
  uniformes,
  municipioDefault,
}: EducacionProps) => {
  const [nuevaTalla, setNuevaTalla] = useState({
    uniformeId: 0,
    talla: "",
  });

  const esEducacion =
    form.tipo_ayuda_nombre?.toLowerCase().includes("kit") ||
    form.tipo_ayuda_nombre?.toLowerCase().includes("uniforme");

  const incluyeUniforme =
    form.tipo_ayuda_nombre?.toLowerCase().includes("uniforme");

  const parroquiasFiltradas = parroquias.filter(
    (p) => p.municipio_id === (form.edu_municipio_id || municipioDefault)
  );

  const institucionesFiltradas = instituciones.filter(
    (i) =>
      i.tipo_institucion_id === form.edu_tipo_institucion_id &&
      parroquiasFiltradas.some((p) => {
        const instMunicipio = municipios.find(
          (m) =>
            parroquias.some(
              (pp) =>
                pp.id === i.id && pp.municipio_id === m.id
            )
        );
        return true;
      })
  );

  const handleAgregarUniforme = () => {
    if (!nuevaTalla.uniformeId || !nuevaTalla.talla.trim()) return;

    const uniforme = uniformes.find((u) => u.id === nuevaTalla.uniformeId);
    if (!uniforme) return;

    const newRow: UniformeRow = {
      uniformeId: nuevaTalla.uniformeId,
      uniformeNombre: uniforme.nombre,
      talla: nuevaTalla.talla,
    };

    setForm({
      ...form,
      edu_uniformes: [...form.edu_uniformes, newRow],
    });
    setNuevaTalla({ uniformeId: 0, talla: "" });
  };

  const handleEliminarUniforme = (index: number) => {
    setForm({
      ...form,
      edu_uniformes: form.edu_uniformes.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <Box
      p={2}
      sx={{
        bgcolor: "primary.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "primary.200",
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} color="primary">
        Datos Específicos: Educación y Desarrollo Infantil
      </Typography>

      <Grid container spacing={2}>
        {/* Municipio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Municipio"
            fullWidth
            required
            select
            value={form.edu_municipio_id || ""}
            onChange={(e) =>
              setForm({ ...form, edu_municipio_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {municipios.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Parroquia */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Parroquia"
            fullWidth
            required
            select
            value={form.edu_parroquia_id || ""}
            onChange={(e) =>
              setForm({ ...form, edu_parroquia_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {parroquiasFiltradas.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Tipo de Institución */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Tipo de Institución"
            fullWidth
            required
            select
            value={form.edu_tipo_institucion_id || ""}
            onChange={(e) =>
              setForm({
                ...form,
                edu_tipo_institucion_id: Number(e.target.value),
              })
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

        {/* Institución */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Nombre de Institución"
            fullWidth
            required
            select
            value={form.edu_institucion_id || ""}
            onChange={(e) =>
              setForm({
                ...form,
                edu_institucion_id: Number(e.target.value),
              })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {institucionesFiltradas.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Bloque Uniforme y Talla */}
      {incluyeUniforme && (
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Uniformes y Tallas
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Uniforme"
                fullWidth
                select
                size="small"
                value={nuevaTalla.uniformeId}
                onChange={(e) =>
                  setNuevaTalla({
                    ...nuevaTalla,
                    uniformeId: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>
                  <em>Seleccione</em>
                </MenuItem>
                {uniformes.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Talla (Numérica)"
                fullWidth
                size="small"
                value={nuevaTalla.talla}
                onChange={(e) =>
                  setNuevaTalla({ ...nuevaTalla, talla: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                variant="contained"
                startIcon={<IconPlus size={16} />}
                onClick={handleAgregarUniforme}
                disabled={!nuevaTalla.uniformeId || !nuevaTalla.talla.trim()}
                fullWidth
              >
                Agregar
              </Button>
            </Grid>
          </Grid>

          {/* Tabla Dinámica de Tallas */}
          {form.edu_uniformes.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Uniforme</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Talla</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Acción
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.edu_uniformes.map((row: UniformeRow, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{row.uniformeNombre}</TableCell>
                      <TableCell>{row.talla}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarUniforme(index)}
                        >
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
      )}
    </Box>
  );
};

export default Educacion;
