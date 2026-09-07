"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  Tooltip,
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
  tipo_usuario: string;
  creado: string;
  ventanas: string[];
}

interface Ventana {
  id: number;
  clave: string;
  titulo: string;
}

const TEMPLATE_CLAVES = ["Typography", "Shadow", "Icons", "sample-page"];
const TEMPLATE_TITLES = ["Typography", "Shadow", "Icons", "Sample Page"];

const emptyForm = { username: "", nombre: "", email: "", password: "", tipo_usuario: "operador" };

const UsuariosPage = () => {
  const { data: session } = useSession();
  const currentUsername = (session?.user as any)?.username || "";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ventanas, setVentanas] = useState<Ventana[]>([]);
  const [ventanasSeleccionadas, setVentanasSeleccionadas] = useState<number[]>([]);
  const [dialogError, setDialogError] = useState<string | null>(null);

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
      if (res.ok) {
        const data = await res.json();
        setVentanas(
          data.filter(
            (v: Ventana) =>
              !TEMPLATE_CLAVES.includes(v.clave) &&
              !TEMPLATE_TITLES.some((t) => v.titulo.includes(t))
          )
        );
      }
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

  const validateForm = (): string | null => {
    if (!editando) {
      if (!form.username.trim()) return "El usuario es obligatorio.";
      if (form.username.length > 15) return "El usuario no puede exceder 15 caracteres.";
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return "El usuario solo puede contener letras, números y guiones bajos.";
    }
    if (!form.nombre.trim()) return "El nombre completo es obligatorio.";
    if (form.nombre.length > 100) return "El nombre no puede exceder 100 caracteres.";
    if (!editando) {
      if (!form.email.trim()) return "El correo electrónico es obligatorio.";
    }
    if (form.email && form.email.length > 40) return "El correo electrónico no puede exceder 40 caracteres.";
    if (form.email && form.email.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "El formato del correo electrónico no es válido.";
    }
    if (!editando) {
      if (!form.password) return "La contraseña es obligatoria.";
    }
    if (form.password && form.password.length > 0) {
      if (form.password.length < 6 || form.password.length > 15) return "La contraseña debe tener entre 6 y 15 caracteres.";
    }
    return null;
  };

  const handleGuardar = async () => {
    setDialogError(null);
    const validationError = validateForm();
    if (validationError) {
      setDialogError(validationError);
      return;
    }

    try {
      const res = editando
        ? await fetch(`/api/usuarios/${editando.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: form.nombre.trim(),
              email: form.email.trim(),
              password: form.password,
              tipo_usuario: form.tipo_usuario,
            }),
          })
        : await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: form.username.trim(),
              nombre: form.nombre.trim(),
              email: form.email.trim(),
              password: form.password,
              tipo_usuario: form.tipo_usuario,
            }),
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
      setDialogError(null);
      cargar();
    } catch (e: any) {
      setDialogError(e.message || "Error guardando");
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
    setDialogError(null);
    await cargarVentanas();
    setOpen(true);
  };

  const abrirEditar = async (u: Usuario) => {
    setEditando(u);
    setForm({
      username: u.username,
      nombre: u.nombre,
      email: u.email ?? "",
      password: "",
      tipo_usuario: u.tipo_usuario || "operador",
    });
    setDialogError(null);
    await Promise.all([cargarVentanas(), cargarAccesos(u.id)]);
    setOpen(true);
  };

  const isCurrentUser = (u: Usuario) => u.username === currentUsername;
  const isAdmin = (u: Usuario) => u.username === "admin";
  const isTIC = (u: Usuario) => u.tipo_usuario === "tic";
  const canEditUser = (u: Usuario) => !isAdmin(u) && !isTIC(u) || isCurrentUser(u);

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
                  <TableCell>Tipo</TableCell>
                  <TableCell>Ventanas</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Sin usuarios</TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.nombre}</TableCell>
                      <TableCell>{u.email ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.tipo_usuario === "tic" ? "TIC" : u.tipo_usuario === "admin" ? "Admin" : "Operador"}
                          size="small"
                          color={u.tipo_usuario === "tic" ? "warning" : u.tipo_usuario === "admin" ? "primary" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {u.ventanas.map((v) => (
                            <Chip key={v} label={v} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={
                          isCurrentUser(u) ? "No puede desactivar su propia sesión" :
                          isTIC(u) ? "Usuario TIC: no se puede desactivar" :
                          isAdmin(u) ? "No se puede desactivar el admin" :
                          ""
                        }>
                          <span>
                            <Switch
                              checked={u.activo}
                              onChange={() => toggleActivo(u)}
                              size="small"
                              disabled={isCurrentUser(u) || isTIC(u) || isAdmin(u)}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={
                          !canEditUser(u) ? (isAdmin(u) ? "No se pueden editar permisos del admin" : "Solo el propio usuario TIC puede editarse") : ""
                        }>
                          <span>
                            <IconButton
                              onClick={() => abrirEditar(u)}
                              size="small"
                              disabled={!canEditUser(u)}
                            >
                              <IconPencil size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={
                          isTIC(u) ? "No se puede eliminar un usuario TIC" :
                          isAdmin(u) ? "No se puede eliminar el admin" :
                          ""
                        }>
                          <span>
                            <IconButton
                              onClick={() => eliminar(u)}
                              size="small"
                              color="error"
                              disabled={isAdmin(u) || isTIC(u)}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
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
              {dialogError && (
                <Alert severity="error" onClose={() => setDialogError(null)}>
                  {dialogError}
                </Alert>
              )}
              <TextField
                label="Usuario (login)"
                fullWidth
                disabled={!!editando}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                inputProps={{ maxLength: 15 }}
                required={!editando}
              />
              <TextField
                label="Nombre completo"
                fullWidth
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                inputProps={{ maxLength: 100 }}
                required
              />
              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                inputProps={{ maxLength: 40 }}
                type="email"
                required={!editando}
              />
              <TextField
                label={editando ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña"}
                type="password"
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                inputProps={{ maxLength: 15 }}
                required={!editando}
              />
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuario</InputLabel>
                <Select
                  label="Tipo de Usuario"
                  value={form.tipo_usuario}
                  onChange={(e) => setForm({ ...form, tipo_usuario: e.target.value })}
                  disabled={editando?.username === "admin" || editando?.tipo_usuario === "tic"}
                >
                  <MenuItem value="operador">Operador</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="tic">TIC</MenuItem>
                </Select>
              </FormControl>
              {editando && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Ventanas permitidas
                    {editando.username === "admin" && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        (El administrador tiene acceso a todas las ventanas)
                      </Typography>
                    )}
                    {editando.tipo_usuario === "tic" && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        (El usuario TIC tiene acceso total al sistema)
                      </Typography>
                    )}
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0.5 }}>
                    {ventanas.map((v) => (
                      <FormControlLabel
                        key={v.id}
                        control={
                          <Checkbox
                            checked={
                              editando.username === "admin" || editando.tipo_usuario === "tic"
                                ? true
                                : ventanasSeleccionadas.includes(v.id)
                            }
                            disabled
                            size="small"
                          />
                        }
                        label={v.titulo}
                      />
                    ))}
                  </Box>
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
