import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Upload, Download, FileSpreadsheet, Check, X, Edit2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createWorkbook, addSheetFromJson, downloadWorkbook, readWorkbookToJson } from '../utils/excel';
import { BulkClientItem, Province, City } from '../hooks/useClients';

interface BulkClientUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onUpload: (clients: BulkClientItem[]) => Promise<any>;
  provinces: Province[];
  cities: City[];
}

interface ClientRow {
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  id_province: number;
  id_city: number;
  requires_credit: boolean;
  credit_limit?: number | null;
  credit_days?: number | null;
}

const TEMPLATE_COLUMNS = [
  { key: 'name', label: 'Nombre del Cliente', required: true, example: 'Juan Pérez Distribuciones' },
  { key: 'identification', label: 'RUC/Cédula', required: true, example: '1234567890001' },
  { key: 'identification_type', label: 'Tipo (CED/RUC)', required: true, example: 'RUC' },
  { key: 'email', label: 'Correo Electrónico', required: true, example: 'contacto@ejemplo.com' },
  { key: 'phone', label: 'Teléfono', required: true, example: '+593999999999' },
  { key: 'address', label: 'Dirección', required: true, example: 'Av. Principal 123' },
  { key: 'id_province', label: 'ID Provincia', required: true, example: '1' },
  { key: 'id_city', label: 'ID Ciudad', required: true, example: '1' },
  { key: 'requires_credit', label: 'Requiere Crédito (SI/NO)', required: true, example: 'SI' },
  { key: 'credit_limit', label: 'Límite de Crédito', required: false, example: '5000.00' },
  { key: 'credit_days', label: 'Días de Crédito', required: false, example: '30' },
];

export default function BulkClientUpload({ 
  open, 
  onOpenChange, 
  onSuccess, 
  onUpload,
  provinces,
  cities 
}: BulkClientUploadProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload');
  const [clientsData, setClientsData] = useState<ClientRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    const exampleData = [
      {
        'Nombre del Cliente': 'Juan Pérez Distribuciones',
        'RUC/Cédula': '1234567890001',
        'Tipo (CED/RUC)': 'RUC',
        'Correo Electrónico': 'contacto@ejemplo.com',
        'Teléfono': '+593999999999',
        'Dirección': 'Av. Principal 123',
        'ID Provincia': '1',
        'ID Ciudad': '1',
        'Requiere Crédito (SI/NO)': 'SI',
        'Límite de Crédito': '5000.00',
        'Días de Crédito': '30',
      },
      {
        'Nombre del Cliente': 'María López Comercial',
        'RUC/Cédula': '1234567890002',
        'Tipo (CED/RUC)': 'RUC',
        'Correo Electrónico': 'maria@ejemplo.com',
        'Teléfono': '+593988888888',
        'Dirección': 'Calle Secundaria 456',
        'ID Provincia': '1',
        'ID Ciudad': '1',
        'Requiere Crédito (SI/NO)': 'NO',
        'Límite de Crédito': '',
        'Días de Crédito': '',
      },
    ];

    const colWidths = TEMPLATE_COLUMNS.map(() => 25);
    const wb = createWorkbook();
    addSheetFromJson(wb, 'Clientes', exampleData as Record<string, unknown>[], colWidths);
    await downloadWorkbook(wb, 'plantilla_clientes_nutregam.xlsx');
    toast.success('Plantilla descargada correctamente');
  };

  const validateRow = (row: ClientRow, index: number): string[] => {
    const errors: string[] = [];

    // Convertir valores a string de manera segura
    const name = String(row.name || '').trim();
    const identification = String(row.identification || '').trim();
    const identificationType = String(row.identification_type || '').trim();
    const email = String(row.email || '').trim();
    const phone = String(row.phone || '').trim();
    const address = String(row.address || '').trim();
    const idProvince = String(row.id_province || '').trim();
    const idCity = String(row.id_city || '').trim();

    // Validar campos requeridos
    if (!name) errors.push('Nombre del cliente es requerido');
    if (!identification) errors.push('RUC/Cédula es requerido');
    if (!identificationType) errors.push('Tipo (CED/RUC) es requerido');
    if (!email) errors.push('Correo electrónico es requerido');
    if (!phone) errors.push('Teléfono es requerido');
    if (!address) errors.push('Dirección es requerida');
    if (!idProvince) errors.push('ID Provincia es requerido');
    if (!idCity) errors.push('ID Ciudad es requerido');

    // Validar formato de email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Formato de email inválido');
    }

    // Validar RUC/Cédula
    if (identification && (identification.length < 10 || identification.length > 13)) {
      errors.push('RUC/Cédula debe tener entre 10 y 13 caracteres');
    }

    // Validar crédito
    if (row.requires_credit) {
      if (!row.credit_limit || row.credit_limit <= 0) {
        errors.push('Límite de crédito debe ser mayor a 0');
      }
      if (!row.credit_days || row.credit_days <= 0) {
        errors.push('Días de crédito debe ser mayor a 0');
      }
    }

    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    try {
        const jsonData = await readWorkbookToJson(buffer);

        if (jsonData.length === 0) {
          toast.error('El archivo está vacío');
          return;
        }

        // Mapear los datos del Excel al formato esperado
        const parsedData: ClientRow[] = jsonData.map((row: any) => {
          const idType = String(row['Tipo (CED/RUC)'] || '').trim().toUpperCase();
          
          return {
            name: String(row['Nombre del Cliente'] || '').trim(),
            identification: String(row['RUC/Cédula'] || '').trim(),
            identification_type: (idType === 'CED' || idType === 'RUC' ? idType : 'CED') as 'CED' | 'RUC',
            email: String(row['Correo Electrónico'] || '').trim(),
            phone: String(row['Teléfono'] || '').trim(),
            address: String(row['Dirección'] || '').trim(),
            id_province: Number.parseInt(String(row['ID Provincia'] || '0')),
            id_city: Number.parseInt(String(row['ID Ciudad'] || '0')),
            requires_credit: (row['Requiere Crédito (SI/NO)'] || '').toString().toUpperCase().trim() === 'SI',
            credit_limit: row['Límite de Crédito'] ? Number.parseFloat(String(row['Límite de Crédito'])) : null,
            credit_days: row['Días de Crédito'] ? Number.parseInt(String(row['Días de Crédito'])) : null,
          };
        });

        console.log('Datos parseados del Excel:', parsedData);

        // Validar todos los registros
        const errors: Record<number, string[]> = {};
        parsedData.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) {
            errors[index] = rowErrors;
          }
        });

        setValidationErrors(errors);
        setClientsData(parsedData);
        setStep('preview');
        toast.success(`${parsedData.length} registros cargados`);
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      toast.error('Error al procesar el archivo. Verifica que tenga el formato correcto.');
    }
  };

  const handleCellEdit = (rowIndex: number, columnKey: string, value: string) => {
    const updatedData = [...clientsData];
    const row = { ...updatedData[rowIndex] };

    // Actualizar el valor según el tipo de columna
    if (columnKey === 'requires_credit') {
      row[columnKey] = value.toUpperCase() === 'SI';
    } else if (columnKey === 'credit_limit' || columnKey === 'credit_days') {
      const numValue = Number.parseFloat(value);
      row[columnKey as 'credit_limit' | 'credit_days'] = Number.isNaN(numValue) ? null : numValue;
    } else {
      (row as any)[columnKey] = value;
    }

    updatedData[rowIndex] = row;

    // Revalidar la fila editada
    const rowErrors = validateRow(row, rowIndex);
    const newErrors = { ...validationErrors };
    if (rowErrors.length > 0) {
      newErrors[rowIndex] = rowErrors;
    } else {
      delete newErrors[rowIndex];
    }

    setValidationErrors(newErrors);
    setClientsData(updatedData);
    setEditingCell(null);
  };

  const handleBulkUpload = async () => {
    // Verificar si hay errores de validación
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Hay errores de validación. Por favor corrígelos antes de continuar.');
      return;
    }

    setStep('processing');

    try {
      // Limpiar los datos antes de enviar - eliminar campos null/undefined
      const cleanedData = clientsData.map(client => {
        const data: any = {
          name: client.name,
          identification: client.identification,
          identification_type: client.identification_type,
          email: client.email,
          phone: client.phone,
          address: client.address,
          id_province: client.id_province,
          id_city: client.id_city,
          requires_credit: client.requires_credit,
        };

        // Solo agregar credit_limit y credit_days si requires_credit es true y tienen valor
        if (client.requires_credit && client.credit_limit != null && client.credit_limit > 0) {
          data.credit_limit = client.credit_limit;
        }
        if (client.requires_credit && client.credit_days != null && client.credit_days > 0) {
          data.credit_days = client.credit_days;
        }

        return data;
      });

      console.log('Enviando clientes en bulk (limpiados):', cleanedData);

      const response = await onUpload(cleanedData);

      console.log('Respuesta bulk upload:', response);

      // Manejar la respuesta según el formato de BulkClientResponse
      if (response) {
        const { total, created, updated, failed, errors } = response;
        
        if (failed > 0) {
          // Mostrar errores si los hay
          const errorMessages = errors.map(err => `Fila ${err.index + 1} (${err.name}): ${err.error}`).join('\n');
          toast.error(
            `Procesados: ${created + updated} de ${total}. ${failed} fallaron.\n${errorMessages}`,
            { duration: 8000 }
          );
        } else {
          toast.success(`${created + updated} clientes procesados exitosamente (${created} creados, ${updated} actualizados)`);
        }
        
        onSuccess();
        handleClose();
      } else {
        throw new Error('Error al crear clientes');
      }
    } catch (error) {
      console.error('Error en bulk upload:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear clientes en masa');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setClientsData([]);
    setValidationErrors({});
    setEditingCell(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const removeRow = (index: number) => {
    const newData = clientsData.filter((_, i) => i !== index);
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    // Reindexar errores
    const reindexedErrors: Record<number, string[]> = {};
    Object.keys(newErrors).forEach((key) => {
      const oldIndex = Number.parseInt(key);
      const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
      reindexedErrors[newIndex] = newErrors[oldIndex];
    });
    setValidationErrors(reindexedErrors);
    setClientsData(newData);
    toast.info('Registro eliminado');
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Carga Masiva de Clientes
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Descarga la plantilla, complétala y súbela para cargar múltiples clientes'}
            {step === 'preview' && 'Revisa y edita los datos antes de cargarlos'}
            {step === 'processing' && 'Procesando la carga de clientes...'}
          </DialogDescription>
        </DialogHeader>

        {/* Paso 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-50 p-4 rounded-full">
                  <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg mb-2">Instrucciones</h3>
                <ol className="text-sm text-gray-600 space-y-2 text-left max-w-2xl mx-auto">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Descarga la plantilla de Excel haciendo clic en el botón de abajo</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Completa la plantilla con los datos de tus clientes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Guarda el archivo y súbelo usando el botón de carga</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Revisa los datos y confirma la carga</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Plantilla
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir Archivo Excel
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Notas importantes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Asegúrate de usar los IDs correctos de provincias y ciudades</li>
                    <li>El formato de RUC/Cédula debe tener entre 10 y 13 caracteres</li>
                    <li>El formato de correo electrónico debe ser válido</li>
                    <li>Si requiere crédito, los campos de límite y días son obligatorios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Preview */}
        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {clientsData.length} registros cargados
                  {hasErrors && (
                    <span className="text-red-600 ml-2">
                      ({Object.keys(validationErrors).length} con errores)
                    </span>
                  )}
                </p>
              </div>
              {hasErrors && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Corrige los errores antes de continuar
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUC/Cédula</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Crédito</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsData.map((client, index) => {
                    const rowHasErrors = validationErrors[index];
                    return (
                      <TableRow
                        key={index}
                        className={rowHasErrors ? 'bg-red-50' : ''}
                      >
                        <TableCell className="text-center">
                          {rowHasErrors ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              {index + 1}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Check className="h-4 w-4 text-green-500" />
                              {index + 1}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.row === index && editingCell?.col === 'name' ? (
                            <Input
                              defaultValue={client.name}
                              autoFocus
                              onBlur={(e) => handleCellEdit(index, 'name', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(index, 'name', e.currentTarget.value);
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div
                              onClick={() => setEditingCell({ row: index, col: 'name' })}
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                              {client.name || <span className="text-gray-400">-</span>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.row === index && editingCell?.col === 'identification' ? (
                            <Input
                              defaultValue={client.identification}
                              autoFocus
                              onBlur={(e) => handleCellEdit(index, 'identification', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(index, 'identification', e.currentTarget.value);
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div
                              onClick={() => setEditingCell({ row: index, col: 'identification' })}
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                              {client.identification || <span className="text-gray-400">-</span>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.row === index && editingCell?.col === 'email' ? (
                            <Input
                              defaultValue={client.email}
                              autoFocus
                              type="email"
                              onBlur={(e) => handleCellEdit(index, 'email', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(index, 'email', e.currentTarget.value);
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div
                              onClick={() => setEditingCell({ row: index, col: 'email' })}
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                              {client.email || <span className="text-gray-400">-</span>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.row === index && editingCell?.col === 'phone' ? (
                            <Input
                              defaultValue={client.phone}
                              autoFocus
                              onBlur={(e) => handleCellEdit(index, 'phone', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(index, 'phone', e.currentTarget.value);
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div
                              onClick={() => setEditingCell({ row: index, col: 'phone' })}
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                              {client.phone || <span className="text-gray-400">-</span>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.requires_credit ? (
                            <div className="text-xs">
                              <div className="font-semibold text-green-600">Sí</div>
                              {client.credit_limit != null && <div>${client.credit_limit}</div>}
                              {client.credit_days != null && <div>{client.credit_days} días</div>}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mostrar errores de validación */}
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Errores de Validación:</h4>
                <div className="space-y-2">
                  {Object.entries(validationErrors).map(([index, errors]) => (
                    <div key={index} className="text-sm text-red-700">
                      <span className="font-semibold">Fila {Number.parseInt(index) + 1}:</span>
                      <ul className="list-disc list-inside ml-4">
                        {errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Volver
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={hasErrors || clientsData.length === 0}
              >
                Cargar {clientsData.length} Clientes
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Processing */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h3 className="text-lg mb-2">Procesando carga masiva...</h3>
              <p className="text-sm text-gray-600">Por favor espera mientras creamos los clientes</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}