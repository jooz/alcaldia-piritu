"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
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
} from "@mui/material";
import { IconPencil, IconTrash, IconUserPlus } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  creado: string;
  ventanas: string[];
}

interface Ventana {
  id: number;
  clave: string;
  titulo: string;
}

const emptyForm = { username: "", nombre: "", email: "", password: "" };

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ventanas, setVentanas] = useState<Ventana[]>([]);
  const [ventanasSeleccionadas, setVentanasSeleccionadas] = useState<number[]>([]);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error();
      setUsuarios(await res.json());
      setError(null);
    } catch {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cargarVentanas = async () => {
    try {
      const res = await fetch("/api/ventanas");
      if (res.ok) setVentanas(await res.json());
    } catch {}
  };

  const cargarAccesos = async (userId: number) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/accesos`);
      if (res.ok) {
        const data = await res.json();
        setVentanasSeleccionadas(data.ventanaIds || []);
      }
    } catch {
      setVentanasSeleccionadas([]);
    }
  };

  const handleGuardar = async () => {
    setError(null);
    try {
      const res = editando
        ? await fetch(`/api/usuarios/${editando.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: form.nombre,
              email: form.email,
              password: form.password,
            }),
          })
        : await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando");
      }
      if (editando) {
        await fetch(`/api/usuarios/${editando.id}/accesos`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ventanaIds: ventanasSeleccionadas }),
        });
      }
      setOpen(false);
      setForm(emptyForm);
      setEditando(null);
      setVentanasSeleccionadas([]);
      cargar();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    }
  };

  const toggleActivo = async (u: Usuario) => {
    await fetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !u.activo }),
    });
    cargar();
  };

  const eliminar = async (u: Usuario) => {
    if (!confirm(`¿Eliminar usuario "${u.nombre}"?`)) return;
    const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar");
    }
    cargar();
  };

  const abrirNuevo = async () => {
    setEditando(null);
    setForm(emptyForm);
    setVentanasSeleccionadas([]);
    await cargarVentanas();
    setOpen(true);
  };

  const abrirEditar = async (u: Usuario) => {
    setEditando(u);
    setForm({ username: u.username, nombre: u.nombre, email: u.email ?? "", password: "" });
    await Promise.all([cargarVentanas(), cargarAccesos(u.id)]);
    setOpen(true);
  };

  return (
    <PageContainer title="Usuarios" description="Gestión de usuarios">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>Gestión de Usuarios</Typography>
          <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={abrirNuevo}>
            Nuevo Usuario
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <BlankCard>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Ventanas</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin usuarios</TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.nombre}</TableCell>
                      <TableCell>{u.email ?? "—"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {u.ventanas.map((v) => (
                            <Chip key={v} label={v} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Switch checked={u.activo} onChange={() => toggleActivo(u)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => abrirEditar(u)} size="small">
                          <IconPencil size={18} />
                        </IconButton>
                        <IconButton onClick={() => eliminar(u)} size="small" color="error">
                          <IconTrash size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </BlankCard>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editando ? `Editar: ${editando.username}` : "Nuevo Usuario"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Usuario (login)"
                fullWidth
                disabled={!!editando}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <TextField
                label="Nombre completo"
                fullWidth
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label={editando ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña"}
                type="password"
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {editando && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Ventanas permitidas
                  </Typography>
                  <FormGroup>
                    {ventanas.map((v) => (
                      <FormControlLabel
                        key={v.id}
                        control={
                          <Checkbox
                            checked={ventanasSeleccionadas.includes(v.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setVentanasSeleccionadas([...ventanasSeleccionadas, v.id]);
                              } else {
                                setVentanasSeleccionadas(ventanasSeleccionadas.filter((id) => id !== v.id));
                              }
                            }}
                            size="small"
                          />
                        }
                        label={v.titulo}
                      />
                    ))}
                  </FormGroup>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default UsuariosPage;