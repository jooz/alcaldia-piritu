export interface Genero {
  id: number;
  nombre: string;
}

export interface EstadoCivil {
  id: number;
  nombre: string;
}

export interface CondicionEspecial {
  id: number;
  nombre: string;
}

export interface Parentesco {
  id: number;
  nombre: string;
}

export interface TipoSolicitante {
  id: number;
  nombre: string;
}

export interface Uniforme {
  id: number;
  nombre: string;
}

export interface TipoInstitucion {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Parroquia {
  id: number;
  nombre: string;
  municipio_id: number;
}

export interface Categoria {
  id: number;
  name: string;
}

export interface TipoAyuda {
  id: number;
  nombre: string;
  categoria_solicitud_id: number;
}

export interface Institucion {
  id: number;
  nombre: string;
  tipo_institucion_id: number;
}

export interface Requirement {
  id: number;
  name: string;
  condition: string;
  requiresValidity: boolean;
  validityDays: number;
  mandatory: boolean;
}

export interface TipoAyuda {
  id: number;
  name: string;
  categoryId: number;
  requirements: { requirement: Requirement }[];
}

export interface CentroMedico {
  id: number;
  nombre: string;
  tipo_institucion_id: number;
}

export interface MaterialConstruccion {
  id: number;
  nombre: string;
}

export interface TipoAyudaTecnica {
  id: number;
  nombre: string;
}

export interface ClasificacionEtaria {
  id: number;
  nombre: string;
}

export interface CondicionMovilidad {
  id: number;
  nombre: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
}

export interface Catalogos {
  generos: Genero[];
  estadosCiviles: EstadoCivil[];
  condicionesEspeciales: CondicionEspecial[];
  parentescos: Parentesco[];
  tiposSolicitante: TipoSolicitante[];
  uniformes: Uniforme[];
  tiposInstitucion: TipoInstitucion[];
  municipios: Municipio[];
  parroquias: Parroquia[];
  categorias: Categoria[];
  instituciones: Institucion[];
  centrosMedicos: CentroMedico[];
  materialesConstruccion: MaterialConstruccion[];
  tiposAyudaTecnica: TipoAyudaTecnica[];
  clasificacionesEtarias: ClasificacionEtaria[];
  condicionesMovilidad: CondicionMovilidad[];
  unidadesMedida: UnidadMedida[];
}

export interface UniformeRow {
  uniformeId: number;
  uniformeNombre: string;
  talla: string;
}

export interface AyudaTecnicaRow {
  tipoAyudaTecnicaId: number;
  tipoAyudaTecnicaNombre: string;
  clasificacionEtariaId: number;
  clasificacionEtariaNombre: string;
  peso: string;
  condicionMovilidadId: number;
  condicionMovilidadNombre: string;
}

export interface MaterialRow {
  materialId: number;
  materialNombre: string;
  cantidad: string;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

export interface RecaudosState {
  [requirementId: number]: {
    checked: boolean;
    archivo: File | null;
    fileName: string;
    filePath: string;
    uploading: boolean;
  };
}
