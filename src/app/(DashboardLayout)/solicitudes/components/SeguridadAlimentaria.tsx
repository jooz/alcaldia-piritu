"use client";
import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

interface SeguridadAlimentariaProps {
  form: any;
  setForm: (f: any) => void;
}

const SeguridadAlimentaria = ({
  form,
  setForm,
}: SeguridadAlimentariaProps) => {
  return (
    <Box
      p={2}
      sx={{
        bgcolor: "success.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "success.200",
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} color="success.main">
        Datos Específicos: Seguridad Alimentaria y Nutricional
      </Typography>

      <Grid container spacing={2}>
        {/* Adultos en el núcleo */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="¿Cuántos adultos integran el núcleo?"
            fullWidth
            required
            inputMode="numeric"
            value={form.nucleo_adultos}
            onChange={(e) =>
              setForm({ ...form, nucleo_adultos: onlyDigits(e.target.value) })
            }
          />
        </Grid>

        {/* ¿Existen menores? */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="¿Existen menores en el núcleo?"
            fullWidth
            required
            select
            value={form.nucleo_menores_existe}
            onChange={(e) =>
              setForm({ ...form, nucleo_menores_existe: e.target.value })
            }
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="si">Sí</MenuItem>
          </TextField>
        </Grid>

        {/* Número de menores */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Número de menores"
            fullWidth
            required={form.nucleo_menores_existe === "si"}
            disabled={form.nucleo_menores_existe !== "si"}
            inputMode="numeric"
            value={form.nucleo_menores_cantidad}
            onChange={(e) =>
              setForm({ ...form, nucleo_menores_cantidad: onlyDigits(e.target.value) })
            }
          />
        </Grid>

        {/* ¿Personas con discapacidad? */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="¿Personas con discapacidad?"
            fullWidth
            required
            select
            value={form.nucleo_discapacidad_existe}
            onChange={(e) =>
              setForm({
                ...form,
                nucleo_discapacidad_existe: e.target.value,
              })
            }
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="si">Sí</MenuItem>
          </TextField>
        </Grid>

        {/* Número de personas discapacitadas */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Número de personas discapacitadas"
            fullWidth
            required={form.nucleo_discapacidad_existe === "si"}
            disabled={form.nucleo_discapacidad_existe !== "si"}
            inputMode="numeric"
            value={form.nucleo_discapacidad_cantidad}
            onChange={(e) =>
              setForm({
                ...form,
                nucleo_discapacidad_cantidad: onlyDigits(e.target.value),
              })
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SeguridadAlimentaria;
