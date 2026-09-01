"use client";
import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Collapse,
} from "@mui/material";
import type { TipoSolicitante, Parentesco, Genero, CondicionEspecial } from "./types";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

interface BeneficiarioProps {
  form: any;
  setForm: (f: any) => void;
  tiposSolicitante: TipoSolicitante[];
  parentescos: Parentesco[];
  generos: Genero[];
  condicionesEspeciales: CondicionEspecial[];
}

const Beneficiario = ({
  form,
  setForm,
  tiposSolicitante,
  parentescos,
  generos,
  condicionesEspeciales,
}: BeneficiarioProps) => {
  const esMenorEdad = form.tipo_solicitante_id === 2;
  const showMenorFields = form.solicitud_para === "menores";

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Control de Beneficiario
      </Typography>

      <Grid container spacing={2}>
        {/* Solicitud para */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Solicitud para"
            fullWidth
            required
            select
            value={form.solicitud_para}
            onChange={(e) =>
              setForm({ ...form, solicitud_para: e.target.value })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {tiposSolicitante.map((ts) => (
              <MenuItem key={ts.id} value={ts.id === 1 ? "propia" : "menores"}>
                {ts.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Parentesco (solo si es menores) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Parentesco con el menor"
            fullWidth
            required={showMenorFields}
            disabled={!showMenorFields}
            select
            value={form.parentesco_id}
            onChange={(e) =>
              setForm({ ...form, parentesco_id: e.target.value })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {parentescos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Bloque Datos del Menor */}
      <Collapse in={showMenorFields}>
        <Box
          mt={3}
          p={2}
          sx={{
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Datos del Menor
          </Typography>

          <Grid container spacing={2}>
            {/* Cédula del menor */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Cédula del Menor"
                fullWidth
                inputMode="numeric"
                value={form.menor.cedula}
                onChange={(e) =>
                  setForm({
                    ...form,
                    menor: { ...form.menor, cedula: onlyDigits(e.target.value) },
                  })
                }
              />
            </Grid>

            {/* Nombre del menor */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Nombre del Menor"
                fullWidth
                required
                value={form.menor.nombre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    menor: { ...form.menor, nombre: e.target.value },
                  })
                }
              />
            </Grid>

            {/* Género del menor */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Género"
                fullWidth
                required
                select
                value={form.menor.genero_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    menor: { ...form.menor, genero_id: e.target.value },
                  })
                }
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>
                {generos.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fecha de nacimiento del menor */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.menor.fecha_nacimiento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    menor: { ...form.menor, fecha_nacimiento: e.target.value },
                  })
                }
              />
            </Grid>

            {/* Condición especial del menor */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Condición Especial"
                fullWidth
                select
                value={form.menor.condicion_especial_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    menor: {
                      ...form.menor,
                      condicion_especial_id: e.target.value,
                    },
                  })
                }
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>
                {condicionesEspeciales.map((ce) => (
                  <MenuItem key={ce.id} value={ce.id}>
                    {ce.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Beneficiario;
