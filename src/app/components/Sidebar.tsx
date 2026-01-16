import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  Wrench,
  Trash2,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Box,
  ChefHat,
  Settings,
  ChevronDown,
  ChevronUp,
  Store,
  Factory,
  ShieldCheck,
  Search,
  FolderOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Input } from "./ui/input";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const { user, logout } = useAuth();
  
  // TODOS LOS MENÚS INICIAN COLAPSADOS
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
    subItems?: {
      id: string;
      label: string;
      icon: any;
    }[];
  }

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "products",
      label: "Productos",
      icon: Package,
      subItems: [
        { id: "products", label: "Gestión de Productos", icon: Package },
        { id: "recipes", label: "Recetas", icon: ChefHat },
        { id: "categories", label: "Categorías", icon: FolderOpen },
      ],
    },
    {
      id: "sales",
      label: "Clientes y Ventas",
      icon: Store,
      subItems: [
        { id: "clients", label: "Clientes", icon: Users },
        { id: "sales", label: "Ventas", icon: ShoppingCart },
      ],
    },
    {
      id: "production",
      label: "Producción",
      icon: Factory,
      subItems: [
        { id: "production_management", label: "Producción Diaria", icon: ClipboardList },
        { id: "production", label: "Reportes de Producción", icon: ClipboardList },
        { id: "machinery", label: "Maquinaria", icon: Wrench },
        { id: "waste", label: "Desperdicios", icon: Trash2 },
      ],
    },
    {
      id: "administration",
      label: "Administración",
      icon: ShieldCheck,
      subItems: [
        { id: "users", label: "Usuarios y Roles", icon: UserCog },
        { id: "configuration", label: "Configuración", icon: Settings },
      ],
    },
  ];

  // Lógica de búsqueda
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remover acentos
  };

  const searchNormalized = normalizeText(searchTerm);

  // Filtrar menús según la búsqueda
  const filteredMenuItems = menuItems.map((item) => {
    const itemMatches = normalizeText(item.label).includes(searchNormalized);
    
    if (!item.subItems) {
      // Si es un item sin hijos, verificar si coincide
      return itemMatches || searchTerm === "" ? item : null;
    }

    // Si tiene hijos, filtrar los hijos
    const filteredSubItems = item.subItems.filter((subItem) =>
      normalizeText(subItem.label).includes(searchNormalized)
    );

    // Mostrar el padre si:
    // 1. El padre coincide con la búsqueda
    // 2. Algún hijo coincide con la búsqueda
    // 3. No hay búsqueda activa
    if (itemMatches || filteredSubItems.length > 0 || searchTerm === "") {
      return {
        ...item,
        subItems: searchTerm === "" ? item.subItems : filteredSubItems,
      };
    }

    return null;
  }).filter((item): item is MenuItem => item !== null);

  // Auto-expandir menús cuando hay resultados de búsqueda
  const menusToExpand = searchTerm
    ? filteredMenuItems
        .filter((item) => item.subItems && item.subItems.length > 0)
        .map((item) => item.id)
    : [];

  // Función para navegar directamente a una sección encontrada
  const handleSearchResultClick = (sectionId: string, parentId?: string) => {
    setActiveSection(sectionId);
    setSearchTerm(""); // Limpiar búsqueda después de seleccionar
    if (parentId && !expandedMenus.includes(parentId)) {
      setExpandedMenus([...expandedMenus, parentId]);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Drawer que se abre/cierra en todas las resoluciones */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-neutral-200 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 z-50 flex flex-col shadow-lg`}
      >
        {/* Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-2">
          {/* Barra de búsqueda con ícono */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar sección..."
              className="w-full pl-10 text-sm border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {searchTerm && filteredMenuItems.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm">No se encontraron resultados</p>
              <p className="text-xs text-neutral-400 mt-1">Intenta con otro término</p>
            </div>
          )}

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const hasBadge = item.badge && item.badge > 0;
            
            // Auto-expandir si hay búsqueda activa y el item tiene subitems filtrados
            const shouldAutoExpand = searchTerm && item.subItems && item.subItems.length > 0;
            const isExpanded = shouldAutoExpand || expandedMenus.includes(item.id);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      toggleMenu(item.id);
                    } else {
                      handleSearchResultClick(item.id);
                      // Cerrar sidebar en móvil después de seleccionar
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors relative ${
                    activeSection === item.id
                      ? "bg-[#006A4E]/10 text-[#006A4E]"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm flex-1 text-left">
                    {item.label}
                  </span>
                  {/* Badge con número */}
                  {hasBadge && (
                    <Badge className="min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-[#006A4E] hover:bg-[#005741] text-white">
                      {item.badge}
                    </Badge>
                  )}
                  {item.subItems && (
                    <ChevronDown
                      className={`h-4 w-4 lg:h-5 lg:w-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {/* Submenú con animación */}
                {item.subItems && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-2 lg:pl-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              handleSearchResultClick(subItem.id, item.id);
                              // Cerrar sidebar en móvil después de seleccionar
                              if (window.innerWidth < 1024) {
                                setIsOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-colors text-sm ${
                              activeSection === subItem.id
                                ? "bg-[#006A4E]/10 text-[#006A4E] font-medium"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                          >
                            <SubIcon className="h-4 w-4" />
                            <span className="flex-1 text-left">
                              {subItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-t border-neutral-200 bg-white">
          <div className="mb-3 lg:mb-4">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.name} {/* ⚠️ CAMBIÓ: nameuser → name */}
            </p>
            <p className="text-xs text-neutral-600 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-sm border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
    </>
  );
}