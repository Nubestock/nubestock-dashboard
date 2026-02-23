import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientForm from '../../src/app/components/ClientForm';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    get success() { return mockToastSuccess; },
    get error() { return mockToastError; },
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x">X</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <p data-testid="dialog-description">{children}</p>,
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, variant }: any) => (
    <button 
      onClick={onClick} 
      type={type} 
      disabled={disabled}
      data-variant={variant}
      data-testid={variant === 'outline' ? 'cancel-button' : 'submit-button'}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, type, ...props }: any) => (
    <input
      id={id}
      data-testid={`input-${id}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type || 'text'}
      {...props}
    />
  ),
}));

jest.mock('../../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

jest.mock('../../src/app/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <select 
      value={value} 
      onChange={(e) => {
        if (e.target.value) {
          onValueChange(e.target.value);
        }
      }}
      disabled={disabled}
      data-testid="select"
    >
      <option value="">Select...</option>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => null,
}));

jest.mock('../../src/app/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      data-testid="credit-switch"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

// Test data
const mockProvinces = [
  { id: 1, name: 'Pichincha', id_country: 1 },
  { id: 2, name: 'Guayas', id_country: 1 },
];

const mockCities = [
  { id: 1, name: 'Quito', id_province: 1 },
  { id: 2, name: 'Guayaquil', id_province: 2 },
  { id: 3, name: 'Sangolquí', id_province: 1 },
];

describe('ClientForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnOpenChange = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSubmit: mockOnSubmit,
    provinces: mockProvinces,
    cities: mockCities,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue({});
  });

  // Helper to fill form with valid data - using getAllByTestId to handle multiple selects
  // Order in DOM: identification_type (0), province (1), city (2)
  const fillValidForm = async () => {
    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Client' } });
    fireEvent.change(screen.getByTestId('input-identification'), { target: { value: '1234567890001' } });
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '+593999999999' } });
    fireEvent.change(screen.getByTestId('input-address'), { target: { value: 'Test Address 123' } });
    
    // Get all selects - order is: identification_type (0), province (1), city (2)
    let selects = screen.getAllByTestId('select');
    
    // Select province (second select, index 1)
    fireEvent.change(selects[1], { target: { value: '1' } });
    
    // Wait for re-render after province selection
    await waitFor(() => {
      selects = screen.getAllByTestId('select');
    });
    
    // Select city (third select, index 2)
    fireEvent.change(selects[2], { target: { value: '1' } });
  };

  describe('Rendering', () => {
    it('should render the dialog when open is true', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Agregar Nuevo Cliente');
    });

    it('should not render when open is false', () => {
      render(<ClientForm {...defaultProps} open={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should render all form sections', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByText('Información Básica')).toBeInTheDocument();
      expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      expect(screen.getByText('Ubicación')).toBeInTheDocument();
      expect(screen.getByText('Información de Crédito')).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-identification')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('input-phone')).toBeInTheDocument();
      expect(screen.getByTestId('input-address')).toBeInTheDocument();
    });

    it('should render cancel and submit buttons', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancelar');
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Crear Cliente');
    });

    it('should render provinces in select options', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByRole('option', { name: 'Pichincha' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Guayas' })).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByText(/Completa la información del cliente/)).toBeInTheDocument();
    });

    it('should render three select elements', () => {
      render(<ClientForm {...defaultProps} />);
      
      const selects = screen.getAllByTestId('select');
      expect(selects.length).toBe(3); // province, id_type, city
    });
  });

  describe('Form interactions', () => {
    it('should update name field on change', () => {
      render(<ClientForm {...defaultProps} />);
      
      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'Test Client' } });
      
      expect(nameInput).toHaveValue('Test Client');
    });

    it('should update identification field on change', () => {
      render(<ClientForm {...defaultProps} />);
      
      const idInput = screen.getByTestId('input-identification');
      fireEvent.change(idInput, { target: { value: '1234567890001' } });
      
      expect(idInput).toHaveValue('1234567890001');
    });

    it('should update email field on change', () => {
      render(<ClientForm {...defaultProps} />);
      
      const emailInput = screen.getByTestId('input-email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      expect(emailInput).toHaveValue('test@test.com');
    });

    it('should update phone field on change', () => {
      render(<ClientForm {...defaultProps} />);
      
      const phoneInput = screen.getByTestId('input-phone');
      fireEvent.change(phoneInput, { target: { value: '+593999999999' } });
      
      expect(phoneInput).toHaveValue('+593999999999');
    });

    it('should update address field on change', () => {
      render(<ClientForm {...defaultProps} />);
      
      const addressInput = screen.getByTestId('input-address');
      fireEvent.change(addressInput, { target: { value: 'Test Address 123' } });
      
      expect(addressInput).toHaveValue('Test Address 123');
    });

    it('should handle province selection', async () => {
      render(<ClientForm {...defaultProps} />);
      
      const selects = screen.getAllByTestId('select');
      // Order: identification_type (0), province (1), city (2)
      const provinceSelect = selects[1];
      fireEvent.change(provinceSelect, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(provinceSelect).toHaveValue('1');
      });
    });

    it('should toggle credit switch', () => {
      render(<ClientForm {...defaultProps} />);
      
      const creditSwitch = screen.getByTestId('credit-switch');
      expect(creditSwitch).not.toBeChecked();
      
      fireEvent.click(creditSwitch);
      expect(creditSwitch).toBeChecked();
    });

    it('should show credit fields when credit is enabled', () => {
      render(<ClientForm {...defaultProps} />);
      
      const creditSwitch = screen.getByTestId('credit-switch');
      fireEvent.click(creditSwitch);
      
      expect(screen.getByTestId('input-credit_limit')).toBeInTheDocument();
      expect(screen.getByTestId('input-credit_days')).toBeInTheDocument();
    });

    it('should update credit limit field', () => {
      render(<ClientForm {...defaultProps} />);
      
      const creditSwitch = screen.getByTestId('credit-switch');
      fireEvent.click(creditSwitch);
      
      const creditLimitInput = screen.getByTestId('input-credit_limit');
      fireEvent.change(creditLimitInput, { target: { value: '5000' } });
      
      expect(creditLimitInput).toHaveValue(5000);
    });

    it('should update credit days field', () => {
      render(<ClientForm {...defaultProps} />);
      
      const creditSwitch = screen.getByTestId('credit-switch');
      fireEvent.click(creditSwitch);
      
      const creditDaysInput = screen.getByTestId('input-credit_days');
      fireEvent.change(creditDaysInput, { target: { value: '30' } });
      
      expect(creditDaysInput).toHaveValue(30);
    });

    it('should clear credit fields when value is empty', () => {
      render(<ClientForm {...defaultProps} />);
      
      const creditSwitch = screen.getByTestId('credit-switch');
      fireEvent.click(creditSwitch);
      
      const creditLimitInput = screen.getByTestId('input-credit_limit');
      fireEvent.change(creditLimitInput, { target: { value: '5000' } });
      fireEvent.change(creditLimitInput, { target: { value: '' } });
      
      expect(creditLimitInput).toHaveValue(null);
    });

    it('should change identification type via select', () => {
      render(<ClientForm {...defaultProps} />);
      
      const selects = screen.getAllByTestId('select');
      // Order: identification_type (0), province (1), city (2)
      const idTypeSelect = selects[0];
      fireEvent.change(idTypeSelect, { target: { value: 'CED' } });
      
      expect(idTypeSelect).toHaveValue('CED');
    });
  });

  describe('Form validation', () => {
    it('should show error when required fields are missing', async () => {
      render(<ClientForm {...defaultProps} />);
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Por favor completa todos los campos requeridos');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for invalid email', async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Fill all required fields with invalid email
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Client' } });
      fireEvent.change(screen.getByTestId('input-identification'), { target: { value: '1234567890001' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '+593999999999' } });
      fireEvent.change(screen.getByTestId('input-address'), { target: { value: 'Test Address' } });
      
      // Select province and city - order: id_type(0), province(1), city(2)
      let selects = screen.getAllByTestId('select');
      fireEvent.change(selects[1], { target: { value: '1' } }); // province
      
      await waitFor(() => {
        selects = screen.getAllByTestId('select');
      });
      
      fireEvent.change(selects[2], { target: { value: '1' } }); // city
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Por favor ingresa un email válido');
      });
    });

    it('should show error for identification too short', async () => {
      render(<ClientForm {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Client' } });
      fireEvent.change(screen.getByTestId('input-identification'), { target: { value: '123' } }); // Too short
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '+593999999999' } });
      fireEvent.change(screen.getByTestId('input-address'), { target: { value: 'Test Address' } });
      
      // Order: id_type(0), province(1), city(2)
      let selects = screen.getAllByTestId('select');
      fireEvent.change(selects[1], { target: { value: '1' } }); // province
      
      await waitFor(() => {
        selects = screen.getAllByTestId('select');
      });
      
      fireEvent.change(selects[2], { target: { value: '1' } }); // city
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('RUC/Cédula debe tener entre 10 y 13 caracteres');
      });
    });

    it('should show error for identification too long', async () => {
      render(<ClientForm {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test Client' } });
      fireEvent.change(screen.getByTestId('input-identification'), { target: { value: '12345678901234567' } }); // Too long
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '+593999999999' } });
      fireEvent.change(screen.getByTestId('input-address'), { target: { value: 'Test Address' } });
      
      // Order: id_type(0), province(1), city(2)
      let selects = screen.getAllByTestId('select');
      fireEvent.change(selects[1], { target: { value: '1' } }); // province
      
      await waitFor(() => {
        selects = screen.getAllByTestId('select');
      });
      
      fireEvent.change(selects[2], { target: { value: '1' } }); // city
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('RUC/Cédula debe tener entre 10 y 13 caracteres');
      });
    });

    it('should show error when credit limit is 0 with credit enabled', async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Fill all required fields
      await fillValidForm();
      
      // Enable credit
      fireEvent.click(screen.getByTestId('credit-switch'));
      fireEvent.change(screen.getByTestId('input-credit_limit'), { target: { value: '0' } });
      fireEvent.change(screen.getByTestId('input-credit_days'), { target: { value: '30' } });
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Límite de crédito debe ser mayor a 0');
      });
    });

    it('should show error when credit days is 0 with credit enabled', async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Fill all required fields
      await fillValidForm();
      
      // Enable credit
      fireEvent.click(screen.getByTestId('credit-switch'));
      fireEvent.change(screen.getByTestId('input-credit_limit'), { target: { value: '5000' } });
      fireEvent.change(screen.getByTestId('input-credit_days'), { target: { value: '0' } });
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Días de crédito debe ser mayor a 0');
      });
    });

    it('should show error when credit is enabled but limit is empty', async () => {
      render(<ClientForm {...defaultProps} />);
      
      await fillValidForm();
      
      // Enable credit but don't fill credit fields
      fireEvent.click(screen.getByTestId('credit-switch'));
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Límite de crédito debe ser mayor a 0');
      });
    });
  });

  describe('Form submission', () => {
    it('should submit valid form without credit', async () => {
      render(<ClientForm {...defaultProps} />);
      await fillValidForm();
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Client',
          identification: '1234567890001',
          identification_type: 'RUC',
          email: 'test@test.com',
          phone: '+593999999999',
          address: 'Test Address 123',
          id_province: 1,
          id_city: 1,
          requires_credit: false,
        });
      });
      
      expect(mockToastSuccess).toHaveBeenCalledWith('Cliente creado exitosamente');
    });

    it('should submit valid form with credit', async () => {
      render(<ClientForm {...defaultProps} />);
      await fillValidForm();
      
      // Enable credit and fill credit fields
      fireEvent.click(screen.getByTestId('credit-switch'));
      fireEvent.change(screen.getByTestId('input-credit_limit'), { target: { value: '5000' } });
      fireEvent.change(screen.getByTestId('input-credit_days'), { target: { value: '30' } });
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Client',
          identification: '1234567890001',
          identification_type: 'RUC',
          email: 'test@test.com',
          phone: '+593999999999',
          address: 'Test Address 123',
          id_province: 1,
          id_city: 1,
          requires_credit: true,
          credit_limit: 5000,
          credit_days: 30,
        });
      });
    });

    it('should handle submission error with Error object', async () => {
      const errorMessage = 'Server error';
      mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));
      
      render(<ClientForm {...defaultProps} />);
      await fillValidForm();
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should handle non-Error submission error', async () => {
      mockOnSubmit.mockRejectedValueOnce('String error');
      
      render(<ClientForm {...defaultProps} />);
      await fillValidForm();
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Error al crear cliente');
      });
    });

    it('should close dialog after successful submission', async () => {
      render(<ClientForm {...defaultProps} />);
      await fillValidForm();
      
      const form = screen.getByTestId('dialog-content').querySelector('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Dialog close', () => {
    it('should call onOpenChange when cancel is clicked', () => {
      render(<ClientForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form data when closed', () => {
      render(<ClientForm {...defaultProps} />);
      
      // Fill some data
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Test' } });
      fireEvent.click(screen.getByTestId('cancel-button'));
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
