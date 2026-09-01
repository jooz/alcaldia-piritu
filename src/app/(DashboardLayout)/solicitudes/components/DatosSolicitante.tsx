"use client";
import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { IconSearch } from "@tabler/icons-react";
import type {
  Genero,
  EstadoCivil,
  CondicionEspecial,
  Municipio,
  Parroquia,
} from "./types";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

interface DatosSolicitanteProps {
  form: any;
  setForm: (f: any) => void;
  generos: Genero[];
  estadosCiviles: EstadoCivil[];
  condicionesEspeciales: CondicionEspecial[];
  municipios: Municipio[];
  parroquias: Parroquia[];
  municipioDefault: number | null;
  buscandoCedula: boolean;
  onBuscarCedula: () => void;
}

const DatosSolicitante = ({
  form,
  setForm,
  generos,
  estadosCiviles,
  condicionesEspeciales,
  municipios,
  parroquias,
  municipioDefault,
  buscandoCedula,
  onBuscarCedula,
}: DatosSolicitanteProps) => {
  const parroquiasFiltradas = parroquias.filter(
    (p) => p.municipio_id === (form.municipio_id || municipioDefault)
  );

  const municipioSeleccionado = form.municipio_id || municipioDefault || 0;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Datos del Solicitante
      </Typography>

      <Grid container spacing={2}>
        {/* Cédula + Botón Buscar */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Cédula del Solicitante"
            fullWidth
            required
            inputMode="numeric"
            value={form.cedula}
            onChange={(e) => setForm({ ...form, cedula: onlyDigits(e.target.value) })}
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={onBuscarCedula}
                  disabled={buscandoCedula || !form.cedula.trim()}
                  sx={{ minWidth: "auto", px: 1 }}
                >
                  {buscandoCedula ? (
                    <CircularProgress size={18} />
                  ) : (
                    <IconSearch size={18} />
                  )}
                </Button>
              ),
            }}
          />
        </Grid>

        {/* Nombre */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label="Nombre del Solicitante"
            fullWidth
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </Grid>

        {/* Género */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Género"
            fullWidth
            required
            select
            value={form.genero_id}
            onChange={(e) => setForm({ ...form, genero_id: e.target.value })}
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

        {/* Fecha de Nacimiento */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Fecha de Nacimiento"
            type="date"
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.fecha_nacimiento}
            onChange={(e) =>
              setForm({ ...form, fecha_nacimiento: e.target.value })
            }
          />
        </Grid>

        {/* Estado Civil */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Estado Civil"
            fullWidth
            select
            value={form.estado_civil_id}
            onChange={(e) =>
              setForm({ ...form, estado_civil_id: e.target.value })
            }
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {estadosCiviles.map((ec) => (
              <MenuItem key={ec.id} value={ec.id}>
                {ec.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Teléfono Habitación */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Teléfono Habitación"
            fullWidth
            inputMode="numeric"
            value={form.telefono_habitacion}
            onChange={(e) =>
              setForm({ ...form, telefono_habitacion: onlyDigits(e.target.value) })
            }
          />
        </Grid>

        {/* Teléfono Móvil */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Teléfono Móvil"
            fullWidth
            inputMode="numeric"
            value={form.telefono_movil}
            onChange={(e) =>
              setForm({ ...form, telefono_movil: onlyDigits(e.target.value) })
            }
          />
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email del Solicitante"
            fullWidth
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Grid>

        {/* Condición Especial */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Condición Especial"
            fullWidth
            required
            select
            value={form.condicion_especial_id}
            onChange={(e) =>
              setForm({ ...form, condicion_especial_id: e.target.value })
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

        {/* Municipio (deshabilitado) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Municipio"
            fullWidth
            required
            select
            disabled
            value={municipioSeleccionado}
          >
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
            value={form.parroquia_id}
            onChange={(e) =>
              setForm({ ...form, parroquia_id: e.target.value })
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

        {/* Dirección */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Dirección de Habitación"
            fullWidth
            required
            multiline
            rows={2}
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DatosSolicitante;
