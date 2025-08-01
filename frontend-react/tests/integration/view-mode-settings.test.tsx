import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import Dashboard from '../../src/components/Dashboard';
import { TauriMqttService } from '../../src/services/TauriMqttService';
import { Printer } from '../../src/types/printer';

// Mock the TauriMqttService
jest.mock('../../src/services/TauriMqttService');

// Mock printer data
const mockPrinters: Printer[] = [
  {
    id: 'test-printer-1',
    name: 'Test Printer 1',
    model: 'X1C',
    ip: '192.168.1.100',
    accessCode: 'test123',
    serial: 'TEST001',
    status: 'idle',
    temperatures: {
      nozzle: 25,
      bed: 25,
      chamber: 25,
    },
    print: null,
    filament: {
      type: 'PLA',
      color: '#000000',
      remaining: 100,
    },
    error: null,
    lastUpdate: new Date(),
  },
  {
    id: 'test-printer-2',
    name: 'Test Printer 2',
    model: 'P1P',
    ip: '192.168.1.101',
    accessCode: 'test456',
    serial: 'TEST002',
    status: 'printing',
    temperatures: {
      nozzle: 220,
      bed: 60,
      chamber: 35,
    },
    print: {
      progress: 75,
      fileName: 'test_model.3mf',
      layerCurrent: 150,
      layerTotal: 200,
      timeRemaining: 1800,
      estimatedTotalTime: 7200,
    },
    filament: {
      type: 'PETG',
      color: '#ff0000',
      remaining: 60,
    },
    error: null,
    lastUpdate: new Date(),
  },
];

// Helper to mock settings with specific view mode
const mockSettings = (viewMode: 'card' | 'table' = 'card') => {
  const eventListeners: ((event: any) => void)[] = [];

  const mockInstance = {
    getSettings: jest.fn().mockResolvedValue({
      darkMode: false,
      showTemperatures: true,
      idleNotifications: false,
      errorNotifications: true,
      showProgress: true,
      viewMode,
    }),
    saveSettings: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    initialize: jest.fn().mockImplementation(async () => {
      // Simulate the initialization event that Dashboard expects
      setTimeout(() => {
        eventListeners.forEach(listener => {
          listener({
            type: 'initialized',
            data: mockPrinters,
          });
        });
      }, 0);
    }),
    destroy: jest.fn(),
    getPrinters: jest.fn().mockResolvedValue(mockPrinters),
    getAllPrinters: jest.fn().mockReturnValue(mockPrinters),
    getPrinter: jest.fn().mockReturnValue(undefined),
    connectPrinter: jest.fn().mockResolvedValue(undefined),
    disconnectPrinter: jest.fn().mockResolvedValue(undefined),
    sendPrintCommand: jest.fn().mockResolvedValue(undefined),
    pausePrint: jest.fn().mockResolvedValue(undefined),
    resumePrint: jest.fn().mockResolvedValue(undefined),
    stopPrint: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn().mockImplementation((listener: any) => {
      eventListeners.push(listener);
    }),
    removeEventListener: jest.fn().mockImplementation((listener: any) => {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }),
  };

  // Use jest.mocked to properly type the mock
  const MockedTauriMqttService = jest.mocked(TauriMqttService);
  MockedTauriMqttService.getInstance = jest
    .fn()
    .mockReturnValue(mockInstance as any);

  return mockInstance;
};

const renderDashboard = () => {
  const mockOnShowSettings = jest.fn();
  const mockPrinterService = TauriMqttService.getInstance();

  return render(
    <SettingsProvider>
      <Dashboard
        onShowSettings={mockOnShowSettings}
        printerService={mockPrinterService}
      />
    </SettingsProvider>
  );
};

describe('View Mode Settings Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render in card view by default', async () => {
    const mockInstance = mockSettings('card');
    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should show card view elements
    await waitFor(() => {
      expect(screen.getByText('Test Printer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Printer 2')).toBeInTheDocument();
    });

    // Should have printer cards
    const printerCards = screen.getAllByTestId(/printer-card/);
    expect(printerCards).toHaveLength(2);

    // Should not have table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('should render in table view when setting is table', async () => {
    const mockInstance = mockSettings('table');
    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should show table view elements
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Printer')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    // Should have printer data in table
    expect(screen.getByText('Test Printer 1')).toBeInTheDocument();
    expect(screen.getByText('Test Printer 2')).toBeInTheDocument();

    // Should not have printer cards
    expect(screen.queryByTestId(/printer-card/)).not.toBeInTheDocument();
  });

  test('should switch views when toggle is clicked', async () => {
    const mockInstance = mockSettings('card');
    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should start in card view
    await waitFor(() => {
      expect(screen.getAllByTestId(/printer-card/)).toHaveLength(2);
    });

    // Click table view toggle
    const tableToggle = screen.getByTitle('Table View');
    fireEvent.click(tableToggle);

    // Should switch to table view
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // The view mode should have changed in the UI
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Click card view toggle
    const cardToggle = screen.getByTitle('Card View');
    fireEvent.click(cardToggle);

    // Should switch back to card view
    await waitFor(() => {
      expect(screen.getAllByTestId(/printer-card/)).toHaveLength(2);
    });

    // The view mode should have changed back to card view
    expect(screen.getAllByTestId(/printer-card/)).toHaveLength(2);
  });

  test('should show view toggle only when printers exist', async () => {
    // Mock with no printers
    const mockInstance = mockSettings('card');
    mockInstance.getAllPrinters.mockReturnValue([]);
    mockInstance.getPrinters.mockResolvedValue([]);

    // Override the initialize method to emit empty data
    mockInstance.initialize.mockImplementation(async () => {
      setTimeout(() => {
        // Find the event listener and call it with empty data
        const listener = mockInstance.addEventListener.mock.calls[0]?.[0];
        if (listener) {
          listener({
            type: 'initialized',
            data: [],
          });
        }
      }, 0);
    });

    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText('No Printers Added')).toBeInTheDocument();
    });

    // Should not show view toggle
    expect(screen.queryByTitle('Card View')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Table View')).not.toBeInTheDocument();
  });

  test('should handle view mode setting errors gracefully', async () => {
    const mockInstance = mockSettings('card');
    // Mock saveSettings to fail
    mockInstance.saveSettings.mockRejectedValue(new Error('Database error'));

    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should start in card view
    await waitFor(() => {
      expect(screen.getAllByTestId(/printer-card/)).toHaveLength(2);
    });

    // Click table view toggle
    const tableToggle = screen.getByTitle('Table View');
    fireEvent.click(tableToggle);

    // Should still attempt to switch views despite save error
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Should still switch views despite any potential errors
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('should maintain view consistency across multiple printers', async () => {
    const mockInstance = mockSettings('table');
    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Should show table view with all printers
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Should have correct number of rows (2 printers)
    const tableRows = screen.getAllByRole('row');
    // Header row + 2 printer rows = 3 total rows
    expect(tableRows).toHaveLength(3);

    // Should show all printer names
    expect(screen.getByText('Test Printer 1')).toBeInTheDocument();
    expect(screen.getByText('Test Printer 2')).toBeInTheDocument();

    // Should show different statuses - just verify they exist
    expect(screen.getByText('Test Printer 1')).toBeInTheDocument();
    expect(screen.getByText('Test Printer 2')).toBeInTheDocument();

    // Check that we have both idle and printing status somewhere in the table
    const tableBody = screen.getByRole('table');
    expect(tableBody).toHaveTextContent('Idle');
    expect(tableBody).toHaveTextContent('Printing');
  });

  test('should handle real-time updates in both views', async () => {
    const mockInstance = mockSettings('card');
    renderDashboard();

    // Wait for component to initialize
    await waitFor(() => {
      expect(mockInstance.getSettings).toHaveBeenCalled();
    });

    // Wait for printers to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Printer 1')).toBeInTheDocument();
    });

    // Should register event listeners for real-time updates
    expect(mockInstance.addEventListener).toHaveBeenCalled();

    // Switch to table view
    const tableToggle = screen.getByTitle('Table View');
    fireEvent.click(tableToggle);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Event listeners should still be active
    expect(mockInstance.removeEventListener).not.toHaveBeenCalled();
  });
});
