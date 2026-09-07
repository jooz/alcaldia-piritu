"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { signIn } from "next-auth/react";
import Image from "next/image";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password dialog state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Ingrese usuario y contraseña.");
      return;
    }

    if (trimmedUsername.length > 15 || trimmedPassword.length > 15) {
      setError("Los campos no pueden exceder 15 caracteres.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      username: trimmedUsername,
      password: trimmedPassword,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const handleForgotPassword = async () => {
    setForgotError(null);
    setForgotMsg(null);

    const val = forgotIdentifier.trim();
    if (!val) {
      setForgotError("Ingrese su correo electrónico.");
      return;
    }
    if (val.length > 40) {
      setForgotError("El correo no puede exceder 40 caracteres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setForgotError("Ingrese un formato de correo válido (ejemplo@dominio.com).");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();
      setForgotMsg(data.message || "Si el usuario existe, recibirá un correo con las instrucciones.");
    } catch {
      setForgotMsg("Si el usuario existe, recibirá un correo con las instrucciones.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PageContainer title="Login" description="Inicio de sesión Alcaldía">
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{ height: "100vh" }}
        >
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <Link href="/" style={{ display: "block" }}>
                  <Image
                    src="/images/logos/logo_alcaldia_piritu.PNG"
                    alt="Alcaldía de Píritu"
                    height={80}
                    width={200}
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </Link>
              </Box>
              <Typography
                variant="subtitle1"
                textAlign="center"
                color="textSecondary"
                mb={3}
                mt={1}
              >
                Alcaldía del Municipio Píritu — Acceso al Sistema
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box mb={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="label"
                    htmlFor="username"
                    mb="5px"
                  >
                    Usuario
                  </Typography>
                  <CustomTextField
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    inputProps={{ maxLength: 15 }}
                    autoFocus
                  />
                </Box>
                <Box mb={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="label"
                    htmlFor="password"
                    mb="5px"
                  >
                    Contraseña
                  </Typography>
                  <CustomTextField
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    inputProps={{ maxLength: 15 }}
                  />
                </Box>
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Ingresar"}
                </Button>
              </form>

              <Box mt={2} textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setForgotOpen(true);
                    setForgotIdentifier("");
                    setForgotMsg(null);
                    setForgotError(null);
                  }}
                  sx={{ textDecoration: "none" }}
                >
                  ¿Olvidó su contraseña?
                </Link>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recuperar Contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingrese su correo electrónico registrado. Si el usuario existe, recibirá un correo con las instrucciones para restablecer su contraseña.
          </Typography>

          {forgotMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotMsg}
            </Alert>
          )}
          {forgotError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotError}
            </Alert>
          )}

          <TextField
            label="Correo Electrónico"
            fullWidth
            value={forgotIdentifier}
            onChange={(e) => setForgotIdentifier(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleForgotPassword();
            }}
            inputProps={{ maxLength: 40 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleForgotPassword}
            disabled={forgotLoading}
          >
            {forgotLoading ? <CircularProgress size={20} color="inherit" /> : "Enviar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default LoginPage;
