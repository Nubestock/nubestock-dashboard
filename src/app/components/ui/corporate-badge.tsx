import { Badge } from './badge';
import { AlertTriangle, CheckCircle, Clock, X, Info, TrendingDown } from 'lucide-react';

interface CorporateBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export function CorporateBadge({ variant, children, icon = false, className = '' }: CorporateBadgeProps) {
  const variants = {
    success: {
      bg: 'bg-[#006A4E]/10',
      text: 'text-[#006A4E]',
      border: 'border-[#006A4E]/20',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      Icon: X,
    },
    info: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      Icon: Info,
    },
    neutral: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      Icon: Info,
    },
    primary: {
      bg: 'bg-[#006A4E]',
      text: 'text-white',
      border: 'border-[#006A4E]',
      Icon: Info,
    },
  };

  const config = variants[variant];
  const Icon = config.Icon;

  return (
    <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} ${className}`}>
      {icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </Badge>
  );
}

// Helper específico para estados de stock
export function StockBadge({ current, minimum }: { current: number | string; minimum: number | string }) {
  // Convertir a números para asegurar comparaciones correctas
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const minimumNum = typeof minimum === 'string' ? parseFloat(minimum) : minimum;

  if (currentNum <= 0) {
    return (
      <CorporateBadge variant="error" icon>
        Sin Stock
      </CorporateBadge>
    );
  } else if (currentNum <= minimumNum) {
    return (
      <CorporateBadge variant="error" icon>
        Stock Crítico
      </CorporateBadge>
    );
  } else if (currentNum <= minimumNum * 1.5) {
    return (
      <CorporateBadge variant="warning" icon>
        Stock Bajo
      </CorporateBadge>
    );
  }
  return (
    <CorporateBadge variant="success" icon>
      Stock Normal
    </CorporateBadge>
  );
}

// Helper para estados activo/inactivo
export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <CorporateBadge variant={isActive ? 'success' : 'neutral'}>
      {isActive ? 'Activo' : 'Inactivo'}
    </CorporateBadge>
  );
}

// Helper para estados de pago
export function PaymentStatusBadge({ status }: { status: 'paid' | 'pending' | 'overdue' | 'cancelled' }) {
  const variants = {
    paid: { variant: 'success' as const, label: 'Pagado' },
    pending: { variant: 'warning' as const, label: 'Pendiente' },
    overdue: { variant: 'error' as const, label: 'Vencido' },
    cancelled: { variant: 'neutral' as const, label: 'Cancelado' },
  };

  const config = variants[status];
  return (
    <CorporateBadge variant={config.variant}>
      {config.label}
    </CorporateBadge>
  );
}