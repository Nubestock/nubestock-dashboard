import { renderHook, act, waitFor } from '@testing-library/react';
import { useMachinery, useMaintenance, useMaintenanceHistory, useMachineryAlerts } from '@/app/hooks/useMachinery';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useMachinery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  const mockMachinery = [
    { id: 1, name: 'Máquina 1', description: 'Descripción 1', is_active: true, creation_date: '2024-01-01', modification_date: null },
  ];

  it('should fetch machinery on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockMachinery });

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.machinery).toEqual(mockMachinery);
  });

  it('should fetch with search and isActive params', async () => {
    mockApiRequest.mockResolvedValue({ data: mockMachinery });

    renderHook(() => useMachinery('test', true));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('search=test'));
    });

    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('is_active=true'));
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should handle error without message', async () => {
    mockApiRequest.mockRejectedValue({});

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar maquinaria');
  });

  it('should create machinery', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMachinery })
      .mockResolvedValueOnce({ data: mockMachinery[0] })
      .mockResolvedValueOnce({ data: mockMachinery });

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createMachinery({ name: 'New', description: 'New desc', is_active: true });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/machinery', expect.objectContaining({ method: 'POST' }));
  });

  it('should update machinery', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMachinery })
      .mockResolvedValueOnce({ data: mockMachinery[0] })
      .mockResolvedValueOnce({ data: mockMachinery });

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateMachinery(1, { name: 'Updated' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/machinery/1', expect.objectContaining({ method: 'PUT' }));
  });

  it('should delete machinery', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMachinery })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteMachinery(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/machinery/1', { method: 'DELETE' });
  });

  it('should refetch machinery', async () => {
    mockApiRequest.mockResolvedValue({ data: mockMachinery });

    const { result } = renderHook(() => useMachinery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });
});

describe('useMaintenance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  const mockMaintenance = [
    { id: 1, id_machinery: 1, name: 'Mantenimiento 1', type: 'PRV' as const, is_active: true, next_maintainance_value: 30, last_mantainance_date: '2024-01-01' },
  ];

  it('should fetch maintenance on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockMaintenance });

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.maintenance).toEqual(mockMaintenance);
  });

  it('should fetch with filters', async () => {
    mockApiRequest.mockResolvedValue({ data: mockMaintenance });

    renderHook(() => useMaintenance(1, 'PRV', true));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('id_machinery=1'));
    });

    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('type=PRV'));
    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('is_active=true'));
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.error).toBe('Error');
    });
  });

  it('should handle error without message', async () => {
    mockApiRequest.mockRejectedValue({});

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar mantenimientos');
    });
  });

  it('should create maintenance', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMaintenance })
      .mockResolvedValueOnce({ data: mockMaintenance[0] })
      .mockResolvedValueOnce({ data: mockMaintenance });

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createMaintenance({
        id_machinery: 1,
        name: 'New',
        type: 'PRV',
        is_active: true,
        next_maintainance_value: 30,
        last_mantainance_date: '2024-01-01',
      });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance', expect.objectContaining({ method: 'POST' }));
  });

  it('should update maintenance', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMaintenance })
      .mockResolvedValueOnce({ data: mockMaintenance[0] })
      .mockResolvedValueOnce({ data: mockMaintenance });

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateMaintenance(1, { name: 'Updated' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance/1', expect.objectContaining({ method: 'PUT' }));
  });

  it('should delete maintenance', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockMaintenance })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useMaintenance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteMaintenance(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance/1', { method: 'DELETE' });
  });
});

describe('useMaintenanceHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  const mockHistory = [
    {
      id: 1,
      id_mantainance: 1,
      id_user: 1,
      details: { attachments: [] },
      price: 100,
      next_mantainance_date: '2024-02-01',
      creation_date: '2024-01-01',
    },
  ];

  it('should fetch history on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockHistory });

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.history).toEqual(mockHistory);
  });

  it('should fetch with filters', async () => {
    mockApiRequest.mockResolvedValue({ data: mockHistory });

    renderHook(() => useMaintenanceHistory(1, 2));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('id_mantainance=1'));
    });

    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('id_machinery=2'));
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.error).toBe('Error');
    });
  });

  it('should handle error without message', async () => {
    mockApiRequest.mockRejectedValue({});

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar historial');
    });
  });

  it('should create history', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockHistory })
      .mockResolvedValueOnce({ data: mockHistory[0] })
      .mockResolvedValueOnce({ data: mockHistory });

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createHistory({
        id_mantainance: 1,
        details: { attachments: [] },
        price: 100,
        next_mantainance_date: '2024-02-01',
      });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance/history', expect.objectContaining({ method: 'POST' }));
  });

  it('should update history', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockHistory })
      .mockResolvedValueOnce({ data: mockHistory[0] })
      .mockResolvedValueOnce({ data: mockHistory });

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateHistory(1, { price: 200 });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance/history/1', expect.objectContaining({ method: 'PUT' }));
  });

  it('should delete history', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockHistory })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useMaintenanceHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteHistory(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/maintenance/history/1', { method: 'DELETE' });
  });
});

describe('useMachineryAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  const mockAlerts = [
    {
      id: 1,
      id_mantainance: 1,
      type: 'warning',
      date: '2024-01-01',
      title: 'Alerta',
      message: 'Mensaje',
      is_sent: false,
      creation_date: '2024-01-01',
    },
  ];

  it('should fetch alerts on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockAlerts });

    const { result } = renderHook(() => useMachineryAlerts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.alerts).toEqual(mockAlerts);
  });

  it('should fetch with filters', async () => {
    mockApiRequest.mockResolvedValue({ data: mockAlerts });

    renderHook(() => useMachineryAlerts(1, 'warning', false));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('id_mantainance=1'));
    });

    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('type=warning'));
    expect(mockApiRequest).toHaveBeenCalledWith(expect.stringContaining('is_sent=false'));
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useMachineryAlerts());

    await waitFor(() => {
      expect(result.current.error).toBe('Error');
    });
  });

  it('should handle error without message', async () => {
    mockApiRequest.mockRejectedValue({});

    const { result } = renderHook(() => useMachineryAlerts());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar alertas');
    });
  });

  it('should detect alerts', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockAlerts })
      .mockResolvedValueOnce({ data: { detected: 5 } })
      .mockResolvedValueOnce({ data: mockAlerts });

    const { result } = renderHook(() => useMachineryAlerts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.detectAlerts();
      expect(response).toEqual({ detected: 5 });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/machinery-alerts/detect');
  });

  it('should create alert', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockAlerts })
      .mockResolvedValueOnce({ data: mockAlerts[0] })
      .mockResolvedValueOnce({ data: mockAlerts });

    const { result } = renderHook(() => useMachineryAlerts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createAlert({
        id_mantainance: 1,
        type: 'warning',
        date: '2024-01-01',
        title: 'New Alert',
        message: 'Message',
        is_sent: false,
        user_ids: [1, 2],
      });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/machinery-alerts', expect.objectContaining({ method: 'POST' }));
  });
});
