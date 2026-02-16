/**
 * Tipos TypeScript para la API de Nubestock v2.0
 * 
 * Cambios principales desde v1.0:
 * - IDs: UUID → number (integer)
 * - Campos: camelCase → snake_case
 * - Productos unificados: MP (Materia Prima) + PF (Producto Final)
 * - Producción como transacciones con type='PROD'
 */

// ============================================================================
// Base Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  timestamp: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// Authentication
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number; // en segundos
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

// ============================================================================
// User
// ============================================================================

export interface User {
  id: number;
  username?: string; // Campo adicional que devuelve el backend
  name: string;
  email: string;
  phone?: string;
  full_name?: string; // Campo adicional del backend
  id_role?: number; // Campo adicional del backend
  role_name?: string; // Campo adicional del backend
  is_active: boolean; // Backend usa "is_active" (con guión bajo)
  last_login?: string; // ISO date-time
  creation_date?: string; // ISO date-time
  modification_date?: string; // ISO date-time
  roles?: string[]; // Array de nombres de roles
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  phone?: string;
  is_active?: boolean; // El endpoint /auth/register acepta is_active
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean; // El endpoint PUT /users/:id acepta is_active
}

// ============================================================================
// Product (Unificado: MP + PF)
// ============================================================================

export type ProductType = 'MP' | 'PF'; // MP = Materia Prima, PF = Producto Final

export interface Product {
  id: number;
  id_category: number;
  id_origin: number;
  id_measure: number;
  name: string;
  sku: string;
  type: ProductType;
  min_stock: number;
  quantity: number; // Stock actual
  price: number; // Precio del producto (obligatorio)
  is_active: boolean;
  creation_date: string; // ISO date-time
  
  // Campos relacionados (joins)
  category_name?: string;
  origin_name?: string;
  measure_name?: string;
  id_city?: number;
  id_province?: number;
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  type: ProductType;
  id_category: number;
  id_origin: number;
  id_measure: number;
  min_stock: number;
  price: number; // Precio obligatorio
}

export interface ProductUpdate extends Partial<ProductCreate> {
  is_active?: boolean;
}

// ============================================================================
// Category
// ============================================================================

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

// ============================================================================
// Origin
// ============================================================================

export interface Origin {
  id: number;
  id_city: number;
  name: string;
  id_facility?: string;
  is_active: boolean;
  
  // Campos relacionados (joins)
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

// ============================================================================
// Measure (Unidad de Medida)
// ============================================================================

export interface Measure {
  id: number;
  name: string;
  abbreviation: string;
  is_active: boolean;
}

// ============================================================================
// Recipe (Receta)
// ============================================================================

export interface Recipe {
  id: number;
  id_product: number; // Solo Producto Final (type='PF')
  
  // Campos relacionados
  product_name?: string;
  product_sku?: string;
}

export interface ProductRecipe {
  id: number;
  id_recipe: number;
  id_product: number; // Solo Materia Prima (type='MP')
  quantity: number;
  
  // Campos relacionados
  product_name?: string;
  product_sku?: string;
  measure_name?: string;
}

export interface RecipeCreate {
  id_product: number; // ID del Producto Final
  materials: Array<{
    id_product: number; // ID del Material (MP)
    quantity: number;
  }>;
}

export interface RecipeWithMaterials extends Recipe {
  materials: ProductRecipe[];
}

// ============================================================================
// Client
// ============================================================================

export type IdentificationType = 'CED' | 'RUC';

export interface Client {
  id: number;
  id_city: number;
  id_province: number;
  name: string;
  identification: string;
  identification_type: IdentificationType;
  email: string;
  phone?: string;
  address?: string;
  requires_credit: boolean;
  credit_limit?: number;
  credit_days?: number;
  is_active: boolean;
  creation_date: string; // ISO date-time
  
  // Campos relacionados
  city_name?: string;
  province_name?: string;
}

export interface ClientCreate {
  name: string;
  identification: string;
  identification_type: IdentificationType;
  email: string;
  phone?: string;
  address?: string;
  id_province: number;
  id_city: number;
  requires_credit?: boolean;
  credit_limit?: number;
  credit_days?: number;
}

export interface ClientUpdate extends Partial<ClientCreate> {
  is_active?: boolean;
}

// ============================================================================
// Sale
// ============================================================================

export type SaleStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'credit' | 'transfer' | 'check' | 'other';

export interface Sale {
  id: number;
  id_client: number;
  id_user: number;
  sale_date: string; // ISO date-time
  total_amount: number;
  status: SaleStatus;
  method: PaymentMethod;
  due_date: string; // ISO date-time
  dispatch_guide: string;
  notes?: string;
  is_active: boolean;
  creation_date: string; // ISO date-time
  
  // Campos relacionados
  client_name?: string;
  user_name?: string;
}

export interface SaleProduct {
  id_product: number;
  quantity: number;
  
  // Campos relacionados (para mostrar)
  product_name?: string;
  product_sku?: string;
  unit_price?: number;
}

export interface SaleCreate {
  id_client: number;
  total_amount: number;
  method: PaymentMethod;
  status?: SaleStatus;
  due_date: string; // ISO date-time
  dispatch_guide: string;
  notes?: string;
  products: Array<{
    id_product: number;
    quantity: number;
  }>;
}

export interface SaleUpdate {
  status?: SaleStatus;
  method?: PaymentMethod;
  notes?: string;
}

export interface SaleWithProducts extends Sale {
  products: SaleProduct[];
}

// ============================================================================
// Transaction (Producción, Ingresos, Salidas)
// ============================================================================

export type TransactionType = 'IN' | 'OUT' | 'SAL' | 'PROD';
// IN = Ingreso
// OUT = Salida no comercial
// SAL = Venta
// PROD = Producción

export type TransactionDirection = '+' | '-';

export interface Transaction {
  id: number;
  id_product: number;
  id_user: number;
  quantity: number;
  type: TransactionType;
  direction: TransactionDirection;
  creation_date: string; // ISO date-time
  
  // Campos relacionados
  product_name?: string;
  product_sku?: string;
  user_name?: string;
}

export interface ProductionRegister {
  id_product: number; // ID del Producto Final (type='PF')
  quantity: number;
}

// ============================================================================
// Location (Ubicaciones)
// ============================================================================

export interface Country {
  id: number;
  name: string;
  is_code: string; // Código ISO
  is_active: boolean;
}

export interface Province {
  id: number;
  id_country: number;
  name: string;
  is_code: string;
  is_active: boolean;
}

export interface City {
  id: number;
  id_province: number;
  name: string;
  is_code: string;
  is_active: boolean;
}

// ============================================================================
// Role & Permissions
// ============================================================================

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface RoleCreate {
  name: string;
  description?: string;
  permissions: number[]; // Array de IDs de permisos
}

export interface UserRoleAssignment {
  userId: number;
  roleId: number;
  assignment_reason: string;
}

// ============================================================================
// Alert
// ============================================================================

export type AlertPriority = 'high' | 'medium' | 'low';

export interface Alert {
  id: number;
  alert_type: string;
  alert_title: string;
  alert_message: string;
  entity_type: string;
  priority: AlertPriority;
  is_active: boolean;
  resolved_by?: number;
  creation_date: string; // ISO date-time
  
  // Campos relacionados
  resolver_name?: string;
}

export interface AlertUpdate {
  resolve?: boolean;
  acknowledge?: boolean;
  dismiss?: boolean;
}

// ============================================================================
// Stats
// ============================================================================

export interface DashboardStats {
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    totalInventoryValue: number;
  };
  categories: {
    total: number;
    active: number;
    inactive: number;
  };
  sales: {
    total: number;
    active: number;
    cancelled: number;
    byStatus: {
      pending: number;
      paid: number;
      overdue: number;
      cancelled: number;
    };
    totalValue: number;
    paidValue: number;
    pendingValue: number;
    overdueValue: number;
    thisMonth: {
      count: number;
      value: number;
    };
    thisYear: {
      count: number;
      value: number;
    };
    byWeek?: Array<{
      week: number;
      week_label: string;
      count: number;
      value: number;
    }>;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    withCredit: number;
    totalCreditLimit: number;
  };
  production: {
    total: number;
    thisMonth: number;
    thisYear: number;
  };
  alerts: {
    total: number;
    active: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
    };
    byType: {
      stock_low: number;
    };
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    recent?: Array<{
      id: number;
      product_name: string;
      user_name: string;
      type: TransactionType;
      direction: TransactionDirection;
      quantity: number;
      creation_date: string;
      has_waste?: boolean;
    }>;
  };
}