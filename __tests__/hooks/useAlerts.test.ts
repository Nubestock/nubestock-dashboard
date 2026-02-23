import { renderHook, act, waitFor } from '@testing-library/react';
import { useAlerts } from '@/app/hooks/useAlerts';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  API_CONFIG: {
    ENDPOINTS: {
      ALERTS: '/alerts',
    },
  },
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockAlertsFromAPI = [
    {
      id: 1,
      alert_type: 'low_stock',
      alert_title: 'Stock bajo',
      alert_message: 'El producto X tiene stock bajo',
      entity_type: 'product',
      id_transaction: 100,
      priority: 'high',
      is_active: true,
      creation_date: '2024-01-01T00:00:00Z',
      modification_date: null,
      resolved_at: null,
      resolved_by: null,
      due_date: null,
    },
    {
      id: 2,
      alert_type: 'expiry',
      alert_title: 'Producto por vencer',
      alert_message: 'El producto Y está por vencer',
      entity_type: 'product',
      id_transaction: 101,
      priority: 'medium',
      is_active: true,
      creation_date: '2024-01-02T00:00:00Z',
      modification_date: '2024-01-03T00:00:00Z',
      resolved_at: null,
      resolved_by: null,
      due_date: '2024-01-15',
    },
    {
      id: 3,
      alert_type: 'resolved_alert',
      alert_title: 'Alerta resuelta',
      alert_message: 'Esta alerta fue resuelta',
      entity_type: 'product',
      id_transaction: 102,
      priority: 'low',
      is_active: false,
      creation_date: '2024-01-01T00:00:00Z',
      modification_date: '2024-01-02T00:00:00Z',
      resolved_at: '2024-01-05T00:00:00Z',
      resolved_by: 1,
      due_date: null,
    },
  ];

  describe('fetchAlerts', () => {
    it('should fetch active alerts on mount', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockAlertsFromAPI,
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts(true));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/alerts?is_active=true', { method: 'GET' });
      expect(result.current.alerts).toHaveLength(3);
    });

    it('should fetch all alerts when isActive is false', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockAlertsFromAPI,
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts(false));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/alerts', { method: 'GET' });
    });

    it('should map API response to frontend format correctly', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: [mockAlertsFromAPI[0]],
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const alert = result.current.alerts[0];
      expect(alert.idalert).toBe('1');
      expect(alert.alert_type).toBe('low_stock');
      expect(alert.entity_id).toBe('100');
      expect(alert.status).toBe('active');
    });

    it('should set status as acknowledged when modified but not resolved', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: [mockAlertsFromAPI[1]],
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts[0].status).toBe('acknowledged');
    });

    it('should set status as resolved when resolved_at is set', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: [mockAlertsFromAPI[2]],
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts[0].status).toBe('resolved');
      expect(result.current.alerts[0].resolved_by).toBe('1');
    });

    it('should handle unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({
        success: false,
        data: null,
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
    });

    it('should handle missing data in response', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
    });

    it('should handle 403 error gracefully', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle permission error gracefully', async () => {
      mockApiRequest.mockRejectedValue(new Error('No tiene permisos para esta acción'));

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle other errors silently', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toEqual([]);
    });
  });

  describe('refetch', () => {
    it('should refetch alerts when called', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockAlertsFromAPI,
        timestamp: '2024-01-01',
      });

      const { result } = renderHook(() => useAlerts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledTimes(2);
      });
    });
  });
});
