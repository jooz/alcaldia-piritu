import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint, IconLayoutDashboard, IconUsers, IconShieldLock, IconCategory, IconFileCheck, IconTypography, IconCopy, IconMoodHappy, IconAperture, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";

interface VentanaMeta {
  id: number;
  clave: string;
  titulo: string;
  orden: number;
}

const ICON_MAP: Record<string, any> = {
  dashboard: IconLayoutDashboard,
  usuarios: IconUsers,
  accesos: IconShieldLock,
  categories: IconCategory,
  requirements: IconFileCheck,
  "attention-areas": IconAperture,
  "help-requirements": IconSettings,
  typography: IconTypography,
  shadow: IconCopy,
  icons: IconMoodHappy,
  "sample-page": IconAperture,
};

const HREF_MAP: Record<string, string> = {
  dashboard: "/dashboard",
  usuarios: "/usuarios",
  accesos: "/accesos",
  categories: "/categories",
  requirements: "/requirements",
  "attention-areas": "/attention-areas",
  "help-requirements": "/help-requirements",

};

const SECCIONES = [
  { subheader: "HOME", claves: ["dashboard"] },
  { subheader: "ADMINISTRACIÓN", claves: ["usuarios", "categories", "requirements", "attention-areas", "help-requirements", "accesos"] },

];

function construirMenuItems(ventanas: VentanaMeta[]) {
  const ventanasMap = new Map(ventanas.map((v) => [v.clave, v]));
  const items: any[] = [];

  for (const sec of SECCIONES) {
    const visibles = sec.claves.filter((k) => ventanasMap.has(k));
    if (visibles.length === 0) continue;

    items.push({ navlabel: true, subheader: sec.subheader });

    for (const clave of visibles) {
      const v = ventanasMap.get(clave)!;
      items.push({
        id: `menu-${v.id}`,
        title: v.titulo,
        icon: ICON_MAP[clave] || IconPoint,
        href: HREF_MAP[clave] || `/${clave}`,
        ventana: clave,
      });
    }
  }

  const enSecciones = new Set(SECCIONES.flatMap((s) => s.claves));
  const extras = ventanas.filter((v) => !enSecciones.has(v.clave));
  if (extras.length > 0) {
    items.push({ navlabel: true, subheader: "OTROS" });
    for (const v of extras) {
      items.push({
        id: `menu-${v.id}`,
        title: v.titulo,
        icon: ICON_MAP[v.clave] || IconPoint,
        href: HREF_MAP[v.clave] || `/${v.clave}`,
        ventana: v.clave,
      });
    }
  }

  return items;
}

/**
 * Filtra el árbol de menú dejando solo las ventanas que el usuario
 * tiene permitidas (`allowed` = claves de UserAcceso).
 */
const filterByAllowed = (items: any[], allowed: string[]): any[] => {
  const visible: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.subheader) {
      const hasVisibleChild = items.slice(i + 1).some(
        (it) => it.subheader || !it.ventana || allowed.includes(it.ventana),
      );
      if (hasVisibleChild) visible.push(item);
      continue;
    }

    if (item.ventana && !allowed.includes(item.ventana)) continue;

    if (item.children) {
      const children = filterByAllowed(item.children, allowed);
      if (children.length > 0) visible.push({ ...item, children });
      continue;
    }

    visible.push(item);
  }
  return visible;
};

const renderMenuItems = (items: any[], pathDirect: any, allowed: string[]) => {
  return items.map((item: any) => {
    if (item.ventana && !allowed.includes(item.ventana)) return null;

    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon size="1.3rem" />;

    if (item.subheader) {
      return <Menu subHeading={item.subheader} key={item.subheader} />;
    }

    if (item.children) {
      return (
        <Submenu key={item.id} title={item.title} icon={itemIcon} borderRadius="7px">
          {renderMenuItems(item.children, pathDirect, allowed)}
        </Submenu>
      );
    }

    return (
      <Box px={3} key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius="8px"
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem>
      </Box>
    );
  });
};

const SidebarItems = ({ allowed, ventanas }: { allowed: string[]; ventanas: VentanaMeta[] }) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const menuItems = construirMenuItems(ventanas);
  const visibleItems = filterByAllowed(menuItems, allowed);

  return (
    <>
      <MUI_Sidebar width={"100%"} showProfile={false} themeColor={"#5D87FF"} themeSecondaryColor={'#49beff'}>
        <Logo img="/images/logos/dark-logo.svg" component={Link} to="/dashboard">
          Modernize
        </Logo>
        {renderMenuItems(visibleItems, pathDirect, allowed)}
        <Box px={2}>

        </Box>
      </MUI_Sidebar>
    </>
  );
};
export default SidebarItems;