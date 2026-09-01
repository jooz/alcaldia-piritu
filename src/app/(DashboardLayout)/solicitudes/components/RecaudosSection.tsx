"use client";
import React from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { IconUpload, IconCheck } from "@tabler/icons-react";
import type { Requirement } from "./types";

interface RecaudosState {
  [requirementId: number]: {
    checked: boolean;
    archivo: File | null;
    fileName: string;
    filePath: string;
    uploading: boolean;
  };
}

interface RecaudosSectionProps {
  requirements: Requirement[];
  recaudos: RecaudosState;
  setRecaudos: (r: RecaudosState) => void;
}

const RecaudosSection = ({
  requirements,
  recaudos,
  setRecaudos,
}: RecaudosSectionProps) => {
  const handleToggle = (reqId: number) => {
    setRecaudos({
      ...recaudos,
      [reqId]: {
        ...recaudos[reqId],
        checked: !recaudos[reqId]?.checked,
      },
    });
  };

  const handleFileChange = (reqId: number, file: File | null) => {
    setRecaudos({
      ...recaudos,
      [reqId]: {
        ...recaudos[reqId],
        archivo: file,
        fileName: file?.name || "",
        filePath: "",
        uploading: false,
      },
    });
  };

  if (requirements.length === 0) {
    return (
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Recaudos Requeridos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Seleccione un tipo de ayuda para ver los recaudos requeridos.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Recaudos Requeridos
      </Typography>

      <Stack spacing={1.5}>
        {requirements.map((req) => {
          const state = recaudos[req.id];
          const isChecked = state?.checked || false;
          const fileName = state?.fileName || "";
          const filePath = state?.filePath || "";
          const uploading = state?.uploading || false;
          const isUploaded = !!filePath;

          return (
            <Box
              key={req.id}
              p={1.5}
              sx={{
                bgcolor: isChecked ? "success.50" : "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: isChecked ? "success.200" : "grey.200",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleToggle(req.id)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {req.name}
                    </Typography>
                    {req.condition && (
                      <Typography variant="caption" color="text.secondary">
                        {req.condition}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <Stack direction="row" spacing={1} alignItems="center">
                {isUploaded && (
                  <Chip
                    icon={<IconCheck size={14} />}
                    label={fileName}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {!isUploaded && fileName && uploading && (
                  <Chip
                    icon={<CircularProgress size={12} />}
                    label={fileName}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={uploading ? <CircularProgress size={14} /> : <IconUpload size={14} />}
                  disabled={!isChecked || uploading}
                >
                  {isUploaded ? "Cambiado" : "Adjuntar"}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={(e) =>
                      handleFileChange(req.id, e.target.files?.[0] || null)
                    }
                  />
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default RecaudosSection;
