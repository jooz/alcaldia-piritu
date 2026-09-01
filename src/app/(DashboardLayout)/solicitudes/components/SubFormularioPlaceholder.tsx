"use client";
import React from "react";
import { Box, Typography } from "@mui/material";

interface SubFormularioPlaceholderProps {
  categoria: string;
}

const SubFormularioPlaceholder = ({ categoria }: SubFormularioPlaceholderProps) => {
  return (
    <Box
      p={2}
      sx={{
        bgcolor: "grey.100",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "grey.400",
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={1} color="text.secondary">
        Datos Específicos: {categoria}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Este sub-formulario está en preparación. Próximamente se habilitarán los
        campos específicos para esta categoría.
      </Typography>
    </Box>
  );
};

export default SubFormularioPlaceholder;
