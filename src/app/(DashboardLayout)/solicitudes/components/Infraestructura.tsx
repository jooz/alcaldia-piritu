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
} from "@mui/material";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type {
  MaterialConstruccion,
  UnidadMedida,
  MaterialRow,
} from "./types";

interface TenenciaVivienda {
  id: number;
  nombre: string;
}

interface TipoAfectacion {
  id: number;
  nombre: string;
}

interface InfraestructuraProps {
  form: any;
  setForm: (f: any) => void;
  materialesConstruccion: MaterialConstruccion[];
  unidadesMedida: UnidadMedida[];
  tenenciasVivienda: TenenciaVivienda[];
  tiposAfectacion: TipoAfectacion[];
}

const Infraestructura = ({
  form,
  setForm,
  materialesConstruccion,
  unidadesMedida,
  tenenciasVivienda,
  tiposAfectacion,
}: InfraestructuraProps) => {
  const [nuevoMaterial, setNuevoMaterial] = useState({
    materialId: 0,
    cantidad: "",
    unidadMedidaId: 0,
  });

  const handleAgregar = () => {
    if (!nuevoMaterial.materialId || !nuevoMaterial.cantidad.trim() || !nuevoMaterial.unidadMedidaId)
      return;

    const material = materialesConstruccion.find((m) => m.id === nuevoMaterial.materialId);
    const unidad = unidadesMedida.find((u) => u.id === nuevoMaterial.unidadMedidaId);

    if (!material || !unidad) return;

    const newRow: MaterialRow = {
      materialId: nuevoMaterial.materialId,
      materialNombre: material.nombre,
      cantidad: nuevoMaterial.cantidad,
      unidadMedidaId: nuevoMaterial.unidadMedidaId,
      unidadMedidaNombre: unidad.nombre,
    };

    setForm({
      ...form,
      infra_materiales: [...form.infra_materiales, newRow],
    });
    setNuevoMaterial({ materialId: 0, cantidad: "", unidadMedidaId: 0 });
  };

  const handleEliminar = (index: number) => {
    setForm({
      ...form,
      infra_materiales: form.infra_materiales.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <Box
      p={2}
      sx={{
        bgcolor: "warning.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "warning.200",
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} color="warning.main">
        Datos Específicos: Infraestructura y Vivienda - Materiales de Construcción
      </Typography>

      {/* Cabecera de vivienda */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Tenencia de la Vivienda"
            fullWidth
            required
            select
            value={form.infra_tenencia_vivienda_id || ""}
            onChange={(e) =>
              setForm({ ...form, infra_tenencia_vivienda_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {tenenciasVivienda.map((tv) => (
              <MenuItem key={tv.id} value={tv.id}>
                {tv.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Tipo de Afectación"
            fullWidth
            required
            select
            value={form.infra_tipo_afectacion_id || ""}
            onChange={(e) =>
              setForm({ ...form, infra_tipo_afectacion_id: Number(e.target.value) })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {tiposAfectacion.map((ta) => (
              <MenuItem key={ta.id} value={ta.id}>
                {ta.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Fila de agregación de materiales */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Agregar Material
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Material"
            fullWidth
            select
            size="small"
            value={nuevoMaterial.materialId}
            onChange={(e) =>
              setNuevoMaterial({ ...nuevoMaterial, materialId: Number(e.target.value) })
            }
          >
            <MenuItem value={0}>
              <em>Seleccione</em>
            </MenuItem>
            {materialesConstruccion.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            label="Cantidad"
            fullWidth
            size="small"
            inputMode="numeric"
            value={nuevoMaterial.cantidad}
            onChange={(e) =>
              setNuevoMaterial({ ...nuevoMaterial, cantidad: e.target.value.replace(/\D/g, "") })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Unidad(es)"
            fullWidth
            select
            size="small"
            value={nuevoMaterial.unidadMedidaId}
            onChange={(e) =>
              setNuevoMaterial({ ...nuevoMaterial, unidadMedidaId: Number(e.target.value) })
            }
          >
            <MenuItem value={0}>
              <em>Seleccione</em>
            </MenuItem>
            {unidadesMedida.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Button
            variant="contained"
            startIcon={<IconPlus size={16} />}
            onClick={handleAgregar}
            disabled={!nuevoMaterial.materialId || !nuevoMaterial.cantidad.trim() || !nuevoMaterial.unidadMedidaId}
            fullWidth
          >
            Agregar
          </Button>
        </Grid>
      </Grid>

      {/* Tabla dinámica de materiales */}
      {form.infra_materiales.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unidad(es)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.infra_materiales.map((row: MaterialRow, index: number) => (
                <TableRow key={index}>
                  <TableCell>{row.materialNombre}</TableCell>
                  <TableCell>{row.cantidad}</TableCell>
                  <TableCell>{row.unidadMedidaNombre}</TableCell>
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

export default Infraestructura;
