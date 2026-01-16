import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className = '' }: ResponsiveTableHeaderProps) {
  return (
    <thead className={`bg-neutral-50 ${className}`}>
      {children}
    </thead>
  );
}

interface ResponsiveTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableBody({ children, className = '' }: ResponsiveTableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-neutral-200 ${className}`}>
      {children}
    </tbody>
  );
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveTableRow({ children, className = '', onClick }: ResponsiveTableRowProps) {
  return (
    <tr 
      className={`hover:bg-neutral-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function ResponsiveTableCell({ children, className = '', header = false }: ResponsiveTableCellProps) {
  const baseClasses = 'px-4 sm:px-6 py-3 sm:py-4 text-sm';
  
  if (header) {
    return (
      <th className={`${baseClasses} text-left font-medium text-neutral-700 tracking-wider ${className}`}>
        {children}
      </th>
    );
  }
  
  return (
    <td className={`${baseClasses} text-neutral-900 ${className}`}>
      {children}
    </td>
  );
}
