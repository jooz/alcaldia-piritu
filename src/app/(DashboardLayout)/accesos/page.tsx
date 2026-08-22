"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@mui/material";
import { IconShieldLock } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  activo: boolean;
}

interface Ventana {
  id: number;
  clave: string;
  titulo: string;
  orden: number;
}

const AccesosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ventanas, setVentanas] = useState<Ventana[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, vRes] = await Promise.all([
        fetch("/api/usuarios"),
        fetch("/api/ventanas"),
      ]);
      setUsuarios(await uRes.json());
      setVentanas(await vRes.json());
    } catch {
      setMsg({ tipo: "error", texto: "No se pudieron cargar los datos" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const seleccionarUsuario = async (id: number) => {
    setSelected(id);
    setMsg(null);
    const res = await fetch(`/api/usuarios/${id}/accesos`);
    const data = await res.json();
    setChecked(new Set(data.ventanaIds ?? []));
  };

  const toggle = (vid: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(vid)) next.delete(vid);
      else next.add(vid);
      return next;
    });
  };

  const guardar = async () => {
    if (selected == null) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/usuarios/${selected}/accesos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventanaIds: Array.from(checked) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando accesos");
      setMsg({ tipo: "success", texto: "Acceso actualizado correctamente" });
    } catch (e: any) {
      setMsg({ tipo: "error", texto: e.message || "Error guardando accesos" });
    } finally {
      setSaving(false);
    }
  };

  const usuarioSel = usuarios.find((u) => u.id === selected);

  return (
    <PageContainer title="Accesos" description="Acceso por usuario a ventanas">
      <Box>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          Acceso por Usuario a Ventanas
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Selecciona un usuario y marca las ventanas (módulos del menú) a las que puede acceder.
        </Typography>

        {msg && (
          <Alert severity={msg.tipo} sx={{ mb: 2 }} onClose={() => setMsg(null)}>
            {msg.texto}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <BlankCard>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Ventanas asignadas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      selected={selected === u.id}
                      onClick={() => seleccionarUsuario(u.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.activo ? "Activo" : "Inactivo"}
                          size="small"
                          color={u.activo ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={selected === u.id ? "contained" : "outlined"}
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarUsuario(u.id);
                          }}
                          startIcon={<IconShieldLock size={16} />}
                        >
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </BlankCard>
        )}

        {selected != null && usuarioSel && (
          <Box mt={3}>
            <BlankCard>
              <Box p={3}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Ventanas de {usuarioSel.nombre} ({usuarioSel.username})
                </Typography>
                {usuarioSel.username === "admin" ? (
                  <Alert severity="info">El administrador tiene acceso a todas las ventanas.</Alert>
                ) : (
                  <>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                      {ventanas.map((v) => (
                        <FormControlLabel
                          key={v.id}
                          control={
                            <Checkbox
                              checked={checked.has(v.id)}
                              onChange={() => toggle(v.id)}
                            />
                          }
                          label={v.titulo}
                          sx={{ minWidth: 200 }}
                        />
                      ))}
                    </Stack>
                    <Box mt={3}>
                      <Button variant="contained" onClick={guardar} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar accesos"}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </BlankCard>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default AccesosPage;