"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";
import PageContainer from "../components/container/PageContainer";
import BlankCard from "../components/shared/BlankCard";
import DatosSolicitante from "./components/DatosSolicitante";
import Beneficiario from "./components/Beneficiario";
import Educacion from "./components/Educacion";
import SeguridadAlimentaria from "./components/SeguridadAlimentaria";
import SaludTecnica from "./components/SaludTecnica";
import Infraestructura from "./components/Infraestructura";
import RecaudosSection from "./components/RecaudosSection";
import type {
  Catalogos,
  TipoAyuda,
  Requirement,
  RecaudosState,
} from "./components/types";

const emptyForm = {
  cedula: "",
  nombre: "",
  genero_id: "",
  fecha_nacimiento: "",
  telefono_habitacion: "",
  telefono_movil: "",
  email: "",
  estado_civil_id: "",
  condicion_especial_id: "",
  municipio_id: 17,
  parroquia_id: "",
  direccion: "",

  solicitud_para: "",
  parentesco_id: "",
  menor: {
    cedula: "",
    nombre: "",
    genero_id: "",
    fecha_nacimiento: "",
    condicion_especial_id: "",
  },

  categoria_solicitud_id: "",
  tipo_ayuda_id: "",
  tipo_ayuda_nombre: "",

  edu_municipio_id: 17,
  edu_parroquia_id: "",
  edu_tipo_institucion_id: "",
  edu_institucion_id: "",
  edu_uniformes: [] as any[],

  nucleo_adultos: "",
  nucleo_menores_existe: "no",
  nucleo_menores_cantidad: "",
  nucleo_discapacidad_existe: "no",
  nucleo_discapacidad_cantidad: "",

  salud_diagnostico: "",
  salud_tipo_institucion_id: "",
  salud_institucion_id: "",
  salud_ayudas_tecnicas: [] as any[],

  infra_tenencia_vivienda_id: "",
  infra_tipo_afectacion_id: "",
  infra_materiales: [] as any[],
};

const SolicitudesPage = () => {
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [helpTypes, setHelpTypes] = useState<TipoAyuda[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [recaudos, setRecaudos] = useState<RecaudosState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [buscandoCedula, setBuscandoCedula] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tenenciasVivienda, setTenenciasVivienda] = useState<any[]>([]);
  const [tiposAfectacion, setTiposAfectacion] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const cargarCatalogos = useCallback(async () => {
    try {
      const [res, resTen, resAfect] = await Promise.all([
        fetch("/api/catalogos"),
        fetch("/api/catalogos/tenencias-vivienda"),
        fetch("/api/catalogos/tipos-afectacion"),
      ]);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCatalogos(data);
      if (resTen.ok) setTenenciasVivienda(await resTen.json());
      if (resAfect.ok) setTiposAfectacion(await resAfect.json());

      setForm((prev) => ({
        ...prev,
        municipio_id: data.municipios?.find((m: any) => m.nombre === "Píritu")?.id || 17,
        edu_municipio_id: data.municipios?.find((m: any) => m.nombre === "Píritu")?.id || 17,
      }));
    } catch {
      setError("No se pudieron cargar los catálogos");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarHelpTypes = useCallback(async (categoriaId: number) => {
    try {
      const res = await fetch(`/api/categories/${categoriaId}/help-types`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHelpTypes(Array.isArray(data) ? data : []);
    } catch {
      setHelpTypes([]);
    }
  }, []);

  const cargarRequirements = useCallback(async (helpTypeId: number) => {
    try {
      const allCats = await fetch("/api/categories");
      if (!allCats.ok) throw new Error();
      const cats = await allCats.json();
      for (const cat of cats) {
        const htRes = await fetch(`/api/categories/${cat.id}/help-types`);
        if (!htRes.ok) continue;
        const hts = await htRes.json();
        const ht = Array.isArray(hts) ? hts.find((h: any) => h.id === helpTypeId) : null;
        if (ht && ht.requirements) {
          setRequirements(ht.requirements.map((r: any) => r.requirement));
          return;
        }
      }
      setRequirements([]);
    } catch {
      setRequirements([]);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  useEffect(() => {
    if (form.categoria_solicitud_id) {
      cargarHelpTypes(Number(form.categoria_solicitud_id));
      setHelpTypes([]);
      setRequirements([]);
      setRecaudos({});
      setForm((prev) => ({
        ...prev,
        tipo_ayuda_id: "",
        tipo_ayuda_nombre: "",
      }));
    }
  }, [form.categoria_solicitud_id, cargarHelpTypes]);

  useEffect(() => {
    if (form.tipo_ayuda_id) {
      cargarRequirements(Number(form.tipo_ayuda_id));
      const ht = helpTypes.find((h) => h.id === Number(form.tipo_ayuda_id));
      if (ht) {
        setForm((prev) => ({ ...prev, tipo_ayuda_nombre: ht.name }));
      }
      setRecaudos({});
    }
  }, [form.tipo_ayuda_id, helpTypes, cargarRequirements]);

  useEffect(() => {
    if (requirements.length > 0) {
      const initial: RecaudosState = {};
      requirements.forEach((req) => {
        initial[req.id] = { checked: false, archivo: null, fileName: "", filePath: "", uploading: false };
      });
      setRecaudos(initial);
    }
  }, [requirements]);

  const handleBuscarCedula = async () => {
    if (!form.cedula.trim()) return;
    setBuscandoCedula(true);
    try {
      const res = await fetch(`/api/ciudadanos?cedula=${form.cedula}`);
      const data = await res.json();
      if (data.found && data.solicitante) {
        const s = data.solicitante;
        setForm({
          ...form,
          nombre: s.nombre || "",
          genero_id: s.genero_id || "",
          fecha_nacimiento: s.fecha_nacimiento ? s.fecha_nacimiento.split("T")[0] : "",
          telefono_habitacion: s.telefono_habitacion || "",
          telefono_movil: s.telefono_movil || "",
          email: s.email || "",
          estado_civil_id: s.estado_civil_id || "",
          condicion_especial_id: s.condicion_especial_id || "",
          municipio_id: s.municipio_id || form.municipio_id,
          parroquia_id: s.parroquia_id || "",
          direccion: s.direccion || "",
        });
        setSnackbar({
          open: true,
          message: `Solicitante "${s.nombre}" encontrado. Datos autocompletados.`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Cédula no encontrada. Puede proceder con el registro manual.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Error al buscar la cédula",
        severity: "error",
      });
    } finally {
      setBuscandoCedula(false);
    }
  };

  const validarFormulario = (): string | null => {
    if (!form.cedula.trim()) return "La cédula del solicitante es requerida";
    if (!form.nombre.trim()) return "El nombre del solicitante es requerido";
    if (!form.genero_id) return "El género es requerido";
    if (!form.fecha_nacimiento) return "La fecha de nacimiento es requerida";
    if (!form.condicion_especial_id) return "La condición especial es requerida";
    if (!form.parroquia_id) return "La parroquia es requerida";
    if (!form.direccion.trim()) return "La dirección de habitación es requerida";
    if (!form.solicitud_para) return "El tipo de solicitud es requerido";

    if (form.solicitud_para === "menores") {
      if (!form.parentesco_id) return "El parentesco con el menor es requerido";
      if (!form.menor.nombre.trim()) return "El nombre del menor es requerido";
      if (!form.menor.genero_id) return "El género del menor es requerido";
      if (!form.menor.fecha_nacimiento)
        return "La fecha de nacimiento del menor es requerida";
    }

    if (!form.categoria_solicitud_id)
      return "La categoría de solicitud es requerida";
    if (!form.tipo_ayuda_id) return "El tipo de ayuda es requerido";

    const catNombre =
      catalogos?.categorias.find(
        (c) => c.id === Number(form.categoria_solicitud_id)
      )?.name || "";

    if (catNombre === "Educación y Desarrollo Infantil") {
      if (!form.edu_tipo_institucion_id)
        return "El tipo de institución es requerido";
      if (!form.edu_institucion_id)
        return "La institución es requerida";
    }

    if (catNombre === "Seguridad Alimentaria y Nutricional") {
      if (!form.nucleo_adultos || Number(form.nucleo_adultos) < 1)
        return "La cantidad de adultos en el núcleo es requerida";
      if (
        form.nucleo_menores_existe === "si" &&
        (!form.nucleo_menores_cantidad || Number(form.nucleo_menores_cantidad) < 1)
      )
        return "La cantidad de menores es requerida";
      if (
        form.nucleo_discapacidad_existe === "si" &&
        (!form.nucleo_discapacidad_cantidad ||
          Number(form.nucleo_discapacidad_cantidad) < 1)
      )
        return "La cantidad de personas con discapacidad es requerida";
    }

    if (catNombre === "Salud y Bienestar Médico") {
      if (!form.salud_diagnostico.trim())
        return "El diagnóstico médico es requerido";
      if (!form.salud_tipo_institucion_id)
        return "La institución de salud es requerida";
      if (!form.salud_institucion_id)
        return "La institución es requerida";
      if (form.salud_ayudas_tecnicas.length === 0)
        return "Debe agregar al menos una ayuda técnica";
    }

    if (catNombre === "Infraestructura y Vivienda (Hábitat)") {
      if (!form.infra_tenencia_vivienda_id)
        return "La tenencia de la vivienda es requerida";
      if (!form.infra_tipo_afectacion_id)
        return "El tipo de afectación es requerido";
      if (form.infra_materiales.length === 0)
        return "Debe agregar al menos un material de construcción";
    }

    return null;
  };

  const handleGuardar = async () => {
    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Subir archivos pendientes
      const recaudosEntries = Object.entries(recaudos).filter(([, v]) => v.checked);
      const uploadedRecaudos = [];

      for (const [reqId, rec] of recaudosEntries) {
        if (rec.archivo && !rec.filePath) {
          setRecaudos((prev) => ({
            ...prev,
            [Number(reqId)]: { ...prev[Number(reqId)], uploading: true },
          }));

          const formData = new FormData();
          formData.append('file', rec.archivo);

          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!uploadRes.ok) {
            const errData = await uploadRes.json();
            throw new Error(`Error subiendo ${rec.fileName}: ${errData.error}`);
          }
          const uploadData = await uploadRes.json();

          setRecaudos((prev) => ({
            ...prev,
            [Number(reqId)]: {
              ...prev[Number(reqId)],
              filePath: uploadData.url,
              uploading: false,
            },
          }));

          uploadedRecaudos.push({
            requirementId: Number(reqId),
            fileName: rec.fileName,
            filePath: uploadData.url,
          });
        } else if (rec.filePath) {
          uploadedRecaudos.push({
            requirementId: Number(reqId),
            fileName: rec.fileName,
            filePath: rec.filePath,
          });
        } else {
          uploadedRecaudos.push({
            requirementId: Number(reqId),
            fileName: rec.fileName,
            filePath: '',
          });
        }
      }

      // 2. Enviar solicitud
      const payload = {
        solicitante: {
          cedula: form.cedula,
          nombre: form.nombre,
          genero_id: Number(form.genero_id),
          fecha_nacimiento: form.fecha_nacimiento,
          telefono_habitacion: form.telefono_habitacion,
          telefono_movil: form.telefono_movil,
          email: form.email,
          estado_civil_id: form.estado_civil_id
            ? Number(form.estado_civil_id)
            : null,
          condicion_especial_id: Number(form.condicion_especial_id),
          municipio_id: form.municipio_id,
          parroquia_id: Number(form.parroquia_id),
          direccion: form.direccion,
        },
        beneficiario: {
          tipo_solicitante: form.solicitud_para,
          parentesco_id:
            form.solicitud_para === "menores"
              ? Number(form.parentesco_id)
              : null,
          menor:
            form.solicitud_para === "menores"
              ? {
                  cedula: form.menor.cedula,
                  nombre: form.menor.nombre,
                  genero_id: Number(form.menor.genero_id),
                  fecha_nacimiento: form.menor.fecha_nacimiento,
                  condicion_especial_id: form.menor.condicion_especial_id
                    ? Number(form.menor.condicion_especial_id)
                    : null,
                }
              : null,
        },
        solicitud: {
          categoria_solicitud_id: Number(form.categoria_solicitud_id),
          tipo_ayuda_id: Number(form.tipo_ayuda_id),
        },
        datosEspecificos: construirDatosEspecificos(),
        recaudos: uploadedRecaudos,
      };

      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando la solicitud");
      }

      setSnackbar({
        open: true,
        message: "Solicitud registrada exitosamente",
        severity: "success",
      });
      handleLimpiar();
    } catch (e: any) {
      setError(e.message || "Error guardando la solicitud");
    } finally {
      setSaving(false);
    }
  };

  const construirDatosEspecificos = () => {
    const catNombre =
      catalogos?.categorias.find(
        (c) => c.id === Number(form.categoria_solicitud_id)
      )?.name || "";

    if (catNombre === "Educación y Desarrollo Infantil") {
      return {
        tipo: "educacion",
        municipio_id: form.edu_municipio_id || form.municipio_id,
        parroquia_id: form.edu_parroquia_id
          ? Number(form.edu_parroquia_id)
          : null,
        tipo_institucion_id: form.edu_tipo_institucion_id
          ? Number(form.edu_tipo_institucion_id)
          : null,
        institucion_id: form.edu_institucion_id
          ? Number(form.edu_institucion_id)
          : null,
        uniformes: form.edu_uniformes,
      };
    }

    if (catNombre === "Seguridad Alimentaria y Nutricional") {
      return {
        tipo: "seguridad_alimentaria",
        nucleo_adultos: Number(form.nucleo_adultos),
        nucleo_menores_existe: form.nucleo_menores_existe === "si",
        nucleo_menores_cantidad:
          form.nucleo_menores_existe === "si"
            ? Number(form.nucleo_menores_cantidad)
            : 0,
        nucleo_discapacidad_existe: form.nucleo_discapacidad_existe === "si",
        nucleo_discapacidad_cantidad:
          form.nucleo_discapacidad_existe === "si"
            ? Number(form.nucleo_discapacidad_cantidad)
            : 0,
      };
    }

    if (catNombre === "Salud y Bienestar Médico") {
      return {
        tipo: "salud_tecnica",
        diagnostico: form.salud_diagnostico,
        tipo_institucion_id: form.salud_tipo_institucion_id
          ? Number(form.salud_tipo_institucion_id)
          : null,
        institucion_id: form.salud_institucion_id
          ? Number(form.salud_institucion_id)
          : null,
        ayudas_tecnicas: form.salud_ayudas_tecnicas,
      };
    }

    if (catNombre === "Infraestructura y Vivienda (Hábitat)") {
      return {
        tipo: "infraestructura",
        tenencia_vivienda_id: form.infra_tenencia_vivienda_id
          ? Number(form.infra_tenencia_vivienda_id)
          : null,
        tipo_afectacion_id: form.infra_tipo_afectacion_id
          ? Number(form.infra_tipo_afectacion_id)
          : null,
        materiales: form.infra_materiales,
      };
    }

    return { tipo: catNombre };
  };

  const handleLimpiar = () => {
    setForm({
      ...emptyForm,
      municipio_id: catalogos?.municipios?.find((m) => m.nombre === "Píritu")?.id || 17,
      edu_municipio_id: catalogos?.municipios?.find((m) => m.nombre === "Píritu")?.id || 17,
    });
    setRecaudos({});
    setRequirements([]);
    setError(null);
  };

  const getCategoriaNombre = (): string => {
    return (
      catalogos?.categorias.find(
        (c) => c.id === Number(form.categoria_solicitud_id)
      )?.name || ""
    );
  };

  if (loading) {
    return (
      <PageContainer title="Registrar Solicitud" description="Formulario de solicitud de ayuda">
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Registrar Solicitud de Ayuda"
      description="Formulario de registro de solicitud de ayuda"
    >
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Registrar Solicitud de Ayuda
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <BlankCard>
          <Box p={3}>
            {/* Sección 1: Datos del Solicitante */}
            <DatosSolicitante
              form={form}
              setForm={setForm}
              generos={catalogos?.generos || []}
              estadosCiviles={catalogos?.estadosCiviles || []}
              condicionesEspeciales={catalogos?.condicionesEspeciales || []}
              municipios={catalogos?.municipios || []}
              parroquias={catalogos?.parroquias || []}
              municipioDefault={form.municipio_id}
              buscandoCedula={buscandoCedula}
              onBuscarCedula={handleBuscarCedula}
            />

            <Divider sx={{ my: 3 }} />

            {/* Sección 2: Control de Beneficiario */}
            <Beneficiario
              form={form}
              setForm={setForm}
              tiposSolicitante={catalogos?.tiposSolicitante || []}
              parentescos={catalogos?.parentescos || []}
              generos={catalogos?.generos || []}
              condicionesEspeciales={catalogos?.condicionesEspeciales || []}
            />

            <Divider sx={{ my: 3 }} />

            {/* Sección 3: Categoría y Tipo de Ayuda */}
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Categoría y Tipo de Solicitud
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Categoría de Solicitud"
                  fullWidth
                  required
                  select
                  value={form.categoria_solicitud_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoria_solicitud_id: e.target.value,
                    })
                  }
                  sx={{ maxWidth: 400 }}
                >
                  <MenuItem value="">
                    <em>Seleccione</em>
                  </MenuItem>
                  {catalogos?.categorias.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Tipo de Ayuda"
                  fullWidth
                  required
                  select
                  disabled={!form.categoria_solicitud_id}
                  value={form.tipo_ayuda_id}
                  onChange={(e) =>
                    setForm({ ...form, tipo_ayuda_id: e.target.value })
                  }
                  sx={{ maxWidth: 400 }}
                >
                  <MenuItem value="">
                    <em>Seleccione</em>
                  </MenuItem>
                  {helpTypes.map((ht) => (
                      <MenuItem key={ht.id} value={ht.id}>
                        {ht.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Sección Polimórfica: Datos Específicos */}
            {form.tipo_ayuda_id && (
              <Box mb={3}>
                {renderSubFormulario()}
              </Box>
            )}

            {/* Sección Dinámica: Recaudos */}
            {form.tipo_ayuda_id && (
              <Box mb={3}>
                <RecaudosSection
                  requirements={requirements}
                  recaudos={recaudos}
                  setRecaudos={setRecaudos}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Acciones */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<IconRefresh size={18} />}
                onClick={handleLimpiar}
                disabled={saving}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                startIcon={
                  saving ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy size={18} />
                }
                onClick={handleGuardar}
                disabled={saving}
              >
                Guardar
              </Button>
            </Stack>
          </Box>
        </BlankCard>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );

  function renderSubFormulario() {
    const catNombre = getCategoriaNombre();

    switch (catNombre) {
      case "Educación y Desarrollo Infantil":
        return (
          <Educacion
            form={form}
            setForm={setForm}
            municipios={catalogos?.municipios || []}
            parroquias={catalogos?.parroquias || []}
            tiposInstitucion={catalogos?.tiposInstitucion || []}
            instituciones={catalogos?.instituciones || []}
            uniformes={catalogos?.uniformes || []}
            municipioDefault={form.municipio_id}
          />
        );

      case "Seguridad Alimentaria y Nutricional":
        return (
          <SeguridadAlimentaria form={form} setForm={setForm} />
        );

      case "Salud y Bienestar Médico":
        return (
          <SaludTecnica
            form={form}
            setForm={setForm}
            tiposInstitucion={catalogos?.tiposInstitucion || []}
            centrosMedicos={catalogos?.centrosMedicos || []}
            tiposAyudaTecnica={catalogos?.tiposAyudaTecnica || []}
            clasificacionesEtarias={catalogos?.clasificacionesEtarias || []}
            condicionesMovilidad={catalogos?.condicionesMovilidad || []}
          />
        );

      case "Infraestructura y Vivienda (Hábitat)":
        return (
          <Infraestructura
            form={form}
            setForm={setForm}
            materialesConstruccion={catalogos?.materialesConstruccion || []}
            unidadesMedida={catalogos?.unidadesMedida || []}
            tenenciasVivienda={tenenciasVivienda}
            tiposAfectacion={tiposAfectacion}
          />
        );

      default:
        return null;
    }
  }
};

export default SolicitudesPage;
