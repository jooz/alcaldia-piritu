"use client";

import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  TextField, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Stack
} from '@mui/material';
import Chart from 'react-apexcharts';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

// --- PALETA DE COLORES ---
const COLORS = {
  bg: '#F3F4F6',
  white: '#FFFFFF',
  green: { main: '#22C55E', dark: '#16A34A' },
  yellow: { main: '#EAB308', dark: '#F59E0B' },
  red: { main: '#EF4444', dark: '#DC2626' },
  blue: { main: '#1E40AF', dark: '#2563EB' },
};

// --- MOCK DATA ---
const KPI_DATA = [
  { title: 'Total Solicitudes Registradas', value: '1,580', badge: '+5%', color: COLORS.green.main, icon: null },
  { title: 'Solicitudes Atendidas', value: '985', badge: '✓', color: COLORS.green.main, icon: 'check_circle' },
  { title: 'Solicitudes Pendientes', value: '452', badge: '⌛', color: COLORS.yellow.main, icon: 'hourglass_empty' },
  { title: 'Solicitudes Declinadas/Eliminadas', value: '143', badge: '✕', color: COLORS.red.main, icon: 'cancel' },
];

const TABLE_DATA = [
  { id: 'V-12345678', name: 'Juan Pérez', category: 'Salud', date: '15/05/2024', status: 'Atendida', statusColor: COLORS.green.main, statusIcon: '✓' },
  { id: 'V-98765432', name: 'Ana Gómez', category: 'Vivienda', date: '18/05/2024', status: 'Pendiente', statusColor: COLORS.yellow.main, statusIcon: '⌛' },
  { id: 'V-11223344', name: 'Carlos Díaz', category: 'Alimentación', date: '19/05/2024', status: 'Declinada', statusColor: COLORS.red.main, statusIcon: '✕' },
  { id: 'V-12345678', name: 'Juan Pérez', category: 'Salud', date: '15/05/2024', status: 'Atendida', statusColor: COLORS.green.main, statusIcon: '✓' },
  { id: 'V-12345678', name: 'Juan Pérez', category: 'Salud', date: '15/05/2024', status: 'Atendida', statusColor: COLORS.green.main, statusIcon: '✓' },
];

const Dashboard = () => {
  
  // Configuración Bar Chart (Stacked)
  const barChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
    xaxis: { categories: ['Salud', 'Vivienda', 'Alimentación', 'Ayuda Económica'] },
    yaxis: { max: 700 },
    legend: { position: 'top' },
    colors: [COLORS.green.main, COLORS.yellow.main, COLORS.red.main],
    title: { text: 'Cruce de Datos: Categoría vs. Estado Actual', align: 'left', style: { fontSize: '16px', fontWeight: '600' } },
    dataLabels: { enabled: false },
  };

  const barChartSeries = [
    { name: 'Atendidas', data: [310, 340, 270, 160] },
    { name: 'Pendientes', data: [200, 260, 130, 90] },
    { name: 'Declinadas', data: [50, 50, 50, 50] },
  ];

  // Configuración Donut Chart
  const donutChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: ['Salud', 'Vivienda e Infraestructura', 'Alimentación', 'Ayuda Económica / Préstamos'],
    colors: [COLORS.blue.main, COLORS.green.main, COLORS.yellow.main, COLORS.red.main],
    legend: { position: 'bottom' },
    title: { text: 'Distribución de Solicitudes por Tipo de Ayuda', align: 'left', style: { fontSize: '16px', fontWeight: '600' } },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total', formatter: () => '1,580' } } } } },
  };

  const donutChartSeries = [42, 28, 18, 12];

  return (
    <PageContainer title="Tablero Principal" description="Gestión de Solicitudes Ciudadanas">
      <Box sx={{ bgcolor: COLORS.bg, p: { xs: 1, md: 3 }, borderRadius: 2 }}>
        
        {/* 1. Filtros Superiores */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
                Parameters of Search:
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <TextField 
                  label="Fecha Inicio" 
                  defaultValue="01/01/2024" 
                  size="small" 
                  sx={{ width: 160 }} 
                />
                <TextField 
                  label="Fecha Fin" 
                  defaultValue="31/05/2024" 
                  size="small" 
                  sx={{ width: 160 }} 
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* 2. Métricas Clave (KPIs) */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {KPI_DATA.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', borderLeft: `6px solid ${kpi.color}` }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                  {kpi.title}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111827' }}>
                    {kpi.value}
                  </Typography>
                  <Chip 
                    label={kpi.badge} 
                    size="small" 
                    sx={{ bgcolor: kpi.color, color: 'white', fontWeight: 'bold', height: 20, fontSize: '0.7rem' }} 
                  />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3. Sección Gráfica */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <Chart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={350} />
            </Card>
          </Grid>
        </Grid>

        {/* 4. Tabla de Solicitudes Recientes */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
              Últimas Solicitudes Recientes
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cédula / Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TABLE_DATA.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ color: '#4B5563' }}>{`${row.id} - ${row.name}`}</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>{row.category}</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>{row.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${row.statusIcon} ${row.status}`} 
                        sx={{ 
                          bgcolor: row.statusColor, 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
