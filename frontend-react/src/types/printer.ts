export interface PrinterTemperatures {
  nozzle: number;
  bed: number;
  chamber: number;
}

export interface PrintJob {
  progress: number;
  fileName: string;
  layerCurrent: number;
  layerTotal: number;
  timeRemaining: number;
  estimatedTotalTime: number;
}

export interface FilamentInfo {
  type: string;
  color: string;
  remaining: number;
}

export interface PrinterError {
  printError: number;
  errorCode: number;
  stage: number;
  lifecycle: string;
  gcodeState: string;
  message: string;
}

export type PrinterStatus =
  | 'idle'
  | 'printing'
  | 'paused'
  | 'error'
  | 'offline'
  | 'connecting';

export interface Printer {
  id: string;
  name: string;
  model?: string;
  ip?: string;
  accessCode?: string;
  serial?: string;
  status: PrinterStatus;
  temperatures: PrinterTemperatures;
  print: PrintJob | null;
  filament: FilamentInfo | null;
  error: PrinterError | null;
  lastUpdate: Date;
}

export interface PrinterStatistics {
  total: number;
  online: number;
  printing: number;
  idle: number;
  error: number;
}

export interface NotificationOptions {
  icon?: string;
  printerName?: string;
  subtitle?: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface PrinterServiceEvent {
  type:
    | 'initialized'
    | 'updated'
    | 'printer_added'
    | 'printer_removed'
    | 'printer_paused'
    | 'printer_resumed'
    | 'printer_stopped';
  data: Printer | Printer[];
}

export interface AddPrinterParams {
  name: string;
  model?: string;
  ip: string;
  accessCode: string;
  serial: string;
}

// Additional interfaces for more specific typing
export interface TauriPrintJobData {
  progress: number;
  time_remaining: number;
  estimated_total_time?: number;
  file_name: string;
  print_type?: string;
  layer_current: number;
  layer_total: number;
  speed_level?: number;
  fan_speed?: number;
  stage?: number;
  lifecycle?: string;
}

export interface TauriFilamentData {
  type: string;
  color: string;
  remaining: number;
}

export interface TauriErrorData {
  print_error: number;
  error_code: number;
  stage: number;
  lifecycle: string;
  gcode_state: string;
  message: string;
}
