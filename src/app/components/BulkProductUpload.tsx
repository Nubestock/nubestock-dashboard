import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Loader2, Upload, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import type { BulkProductItem, BulkProductResponse, Category, Origin, Measure } from '../hooks/useProducts';

interface BulkProductUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (products: BulkProductItem[]) => Promise<BulkProductResponse>;
  categories: Category[];
  origins: Origin[];
  measures: Measure[];
}

interface ParsedExcelRow {
  'Nombre *': string;
  'SKU *': string;
  'Tipo *': string;
  'ID Categoría': number | string;
  'ID Origen *': number | string;
  'ID Medida *': number | string;
  'Cantidad Inicial': number;
  'Stock Mínimo': number;
  'Precio *': number;
}

type Step = 1 | 2 | 3 | 4;

interface ValidationError {
  index: number;
  product: BulkProductItem;
  error: string;
}

export default function BulkProductUpload({
  isOpen,
  onClose,
  onUpload,
  categories,
  origins,
  measures,
}: BulkProductUploadProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkProductResponse | null>(null);
  const [productType, setProductType] = useState<'MP' | 'PF'>('PF');
  const [parsedData, setParsedData] = useState<ParsedExcelRow[]>([]);
  const [processedProducts, setProcessedProducts] = useState<BulkProductItem[]>([]);
  const [validProducts, setValidProducts] = useState<BulkProductItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { number: 1, label: 'Plantilla' },
    { number: 2, label: 'Cargar' },
    { number: 3, label: 'Revisar' },
    { number: 4, label: 'Resultado' },
  ];

  const downloadTemplate = () => {
    const examplePrefix = productType === 'PF' ? 'SN-' : 'MP-';
    
    const template = [
      {
        'Nombre *': productType === 'PF' ? 'Ejemplo: Snack Maní Salado 500g' : 'Ejemplo: Maní sin sal',
        'SKU *': `${examplePrefix}EJEMPLO-001`,
        'Tipo *': productType,
        'ID Categoría': categories[0]?.id || '',
        'ID Origen *': origins[0]?.id || '',
        'ID Medida *': measures[0]?.id || '',
        'Cantidad Inicial': productType === 'MP' ? 15.75 : 100,
        'Stock Mínimo': productType === 'MP' ? 5.5 : 20,
        'Precio *': productType === 'MP' ? 8.75 : 12.50,
      },
      {
        'Nombre *': productType === 'PF' ? 'Ejemplo: Snack Mix Tropical 250g' : 'Ejemplo: Aceite vegetal',
        'SKU *': `${examplePrefix}EJEMPLO-002`,
        'Tipo *': productType,
        'ID Categoría': categories[0]?.id || '',
        'ID Origen *': origins[0]?.id || '',
        'ID Medida *': measures[0]?.id || '',
        'Cantidad Inicial': productType === 'MP' ? 25.30 : 150,
        'Stock Mínimo': productType === 'MP' ? 10.25 : 30,
        'Precio *': productType === 'MP' ? 2.50 : 15.00,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    const helpData = [
      ['CATÁLOGO DE CATEGORÍAS'],
      ['ID', 'Nombre'],
      ...categories.map((c) => [c.id, c.name]),
      [],
      ['CATÁLOGO DE ORÍGENES'],
      ['ID', 'Nombre'],
      ...origins.map((o) => [o.id, o.name]),
      [],
      ['CATÁLOGO DE MEDIDAS'],
      ['ID', 'Nombre', 'Abreviación'],
      ...measures.map((m) => [m.id, m.name, m.abbreviation]),
    ];

    const wsHelp = XLSX.utils.aoa_to_sheet(helpData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.utils.book_append_sheet(wb, wsHelp, 'Catálogos');

    const fileName = productType === 'PF' 
      ? 'plantilla_productos_finales.xlsx' 
      : 'plantilla_materias_primas.xlsx';
    XLSX.writeFile(wb, fileName);
    toast.success('Plantilla descargada');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileName(file.name);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ParsedExcelRow[];

      if (jsonData.length === 0) {
        toast.error('El archivo está vacío');
        return;
      }

      setParsedData(jsonData);

      // Convertir y validar productos
      const products: BulkProductItem[] = [];
      const errors: ValidationError[] = [];

      jsonData.forEach((row, index) => {
        const product: BulkProductItem = {
          name: String(row['Nombre *'] || '').trim(),
          sku: String(row['SKU *'] || '').trim().toUpperCase(),
          id_category: row['ID Categoría'] ? Number(row['ID Categoría']) : null,
          id_origin: Number(row['ID Origen *'] || 0),
          id_measure: Number(row['ID Medida *'] || 0),
          type: (row['Tipo *'] || 'PF') as 'MP' | 'PF',
          quantity: row['Cantidad Inicial'] ? Number(row['Cantidad Inicial']) : 0,
          min_stock: row['Stock Mínimo'] ? Number(row['Stock Mínimo']) : 0,
          price: row['Precio *'] ? Number(row['Precio *']) : 0,
        };

        // Validar regla de decimales
        if (product.type === 'PF') {
          const hasDecimalQuantity = product.quantity % 1 !== 0;
          const hasDecimalMinStock = product.min_stock % 1 !== 0;

          if (hasDecimalQuantity || hasDecimalMinStock) {
            const errorParts: string[] = [];
            if (hasDecimalQuantity) errorParts.push(`Cantidad: ${product.quantity}`);
            if (hasDecimalMinStock) errorParts.push(`Stock Mín: ${product.min_stock}`);
            
            errors.push({
              index,
              product,
              error: `Producto Final no permite decimales. ${errorParts.join(', ')}`,
            });
            return; // No agregar este producto a la lista de válidos
          }
        }

        // Validar precio
        if (!product.price || product.price < 0) {
          errors.push({
            index,
            product,
            error: `El precio es obligatorio y debe ser mayor o igual a 0`,
          });
          return;
        }

        products.push(product);
      });

      setProcessedProducts(jsonData.map((row, index) => ({
        name: String(row['Nombre *'] || '').trim(),
        sku: String(row['SKU *'] || '').trim().toUpperCase(),
        id_category: row['ID Categoría'] ? Number(row['ID Categoría']) : null,
        id_origin: Number(row['ID Origen *'] || 0),
        id_measure: Number(row['ID Medida *'] || 0),
        type: (row['Tipo *'] || 'PF') as 'MP' | 'PF',
        quantity: row['Cantidad Inicial'] ? Number(row['Cantidad Inicial']) : 0,
        min_stock: row['Stock Mínimo'] ? Number(row['Stock Mínimo']) : 0,
      })));
      setValidProducts(products);
      setValidationErrors(errors);
      setCurrentStep(3);

      if (errors.length > 0) {
        toast.warning(`${products.length} válidos, ${errors.length} con errores`);
      } else {
        toast.success(`${jsonData.length} productos cargados`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar archivo';
      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmUpload = async () => {
    setIsUploading(true);
    try {
      // Solo enviar productos válidos al backend
      const result = await onUpload(validProducts);
      setUploadResult(result);
      setCurrentStep(4);

      if (result.failed === 0) {
        toast.success(`${result.created} creados, ${result.updated} actualizados`);
      } else {
        toast.warning(`${result.failed} errores. ${result.created} creados, ${result.updated} actualizados`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setParsedData([]);
    setProcessedProducts([]);
    setUploadResult(null);
    setFileName('');
    onClose();
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return 'Sin categoría';
    const category = categories.find(c => c.id === id);
    return category?.name || `ID: ${id}`;
  };

  const getOriginName = (id: number) => {
    const origin = origins.find(o => o.id === id);
    return origin?.name || `ID: ${id}`;
  };

  const getMeasureName = (id: number) => {
    const measure = measures.find(m => m.id === id);
    return measure?.name || `ID: ${id}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header con breadcrumb integrado */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">Carga Masiva</DialogTitle>
          
          {/* Breadcrumb minimalista */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                      currentStep > step.number
                        ? 'bg-[#006A4E] text-white'
                        : currentStep === step.number
                        ? 'bg-[#006A4E] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-px mx-2 ${currentStep > step.number ? 'bg-[#006A4E]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* PASO 1: Plantilla */}
          {currentStep === 1 && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Tipo de producto</label>
                <Select value={productType} onValueChange={(value) => setProductType(value as 'MP' | 'PF')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Productos Finales</SelectItem>
                    <SelectItem value="MP">Materias Primas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="w-full h-24 border-dashed border-2 hover:border-[#006A4E] hover:bg-[#006A4E]/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Download className="h-5 w-5 text-gray-600" />
                  <span className="text-sm">Descargar Plantilla</span>
                </div>
              </Button>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentStep(2)} className="bg-[#006A4E] hover:bg-[#005741]">
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* PASO 2: Cargar */}
          {currentStep === 2 && (
            <div className="max-w-xl mx-auto space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 border-dashed border-2 hover:border-[#006A4E] hover:bg-[#006A4E]/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-600" />
                  <span className="text-sm">Seleccionar archivo Excel</span>
                  <span className="text-xs text-gray-500">Máximo 1000 productos</span>
                </div>
              </Button>

              <div className="flex justify-between pt-4">
                <Button onClick={() => setCurrentStep(1)} variant="ghost">
                  Volver
                </Button>
              </div>
            </div>
          )}

          {/* PASO 3: Vista Previa */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {fileName} · {parsedData.length} productos
                </p>
                {validationErrors.length > 0 && (
                  <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                    {validationErrors.length} con errores
                  </Badge>
                )}
              </div>

              {/* Tabla de errores de validación */}
              {validationErrors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">
                    Errores de Validación ({validationErrors.length})
                  </p>
                  <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50/50">
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-red-50">
                          <TableRow>
                            <TableHead className="w-10 text-gray-500">#</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="w-16">Tipo</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Mín.</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationErrors.map((error) => (
                            <TableRow key={error.index} className="bg-white">
                              <TableCell className="text-gray-400 text-xs">{error.index}</TableCell>
                              <TableCell className="text-sm">{error.product.name}</TableCell>
                              <TableCell className="font-mono text-xs">{error.product.sku}</TableCell>
                              <TableCell>
                                <span className="text-xs text-green-600">
                                  {error.product.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm text-red-600">
                                {error.product.quantity}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm text-red-600">
                                {error.product.min_stock}
                              </TableCell>
                              <TableCell className="text-xs text-red-600">{error.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Estos productos no se cargarán. Los productos finales (PF) solo permiten cantidades enteras.
                  </p>
                </div>
              )}

              {/* Tabla de productos válidos */}
              {validProducts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Productos Válidos ({validProducts.length})
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-auto max-h-[350px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50">
                          <TableRow>
                            <TableHead className="w-10 text-gray-500">#</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="w-16">Tipo</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead>Medida</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Mín.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validProducts.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-gray-400 text-xs">{index}</TableCell>
                              <TableCell className="text-sm">{product.name}</TableCell>
                              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                              <TableCell>
                                <span className={`text-xs ${product.type === 'MP' ? 'text-blue-600' : 'text-green-600'}`}>
                                  {product.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{getCategoryName(product.id_category)}</TableCell>
                              <TableCell className="text-sm text-gray-600">{getOriginName(product.id_origin)}</TableCell>
                              <TableCell className="text-sm text-gray-600">{getMeasureName(product.id_measure)}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{product.quantity}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{product.min_stock}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {validProducts.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    No hay productos válidos para cargar. Todos tienen errores de validación.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button onClick={() => setCurrentStep(2)} variant="ghost">
                  Volver
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={isUploading || validProducts.length === 0}
                  className="bg-[#006A4E] hover:bg-[#005741]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Confirmar ${validProducts.length} productos`
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* PASO 4: Resultados */}
          {currentStep === 4 && uploadResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="text-2xl font-semibold">{uploadResult.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-semibold text-green-600">{uploadResult.created}</div>
                  <div className="text-xs text-gray-600">Creados</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-semibold text-blue-600">{uploadResult.updated}</div>
                  <div className="text-xs text-gray-600">Actualizados</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-semibold text-red-600">{uploadResult.failed}</div>
                  <div className="text-xs text-gray-600">Errores</div>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Errores ({uploadResult.errors.length})</p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50">
                          <TableRow>
                            <TableHead className="w-16">Fila</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.errors.map((error, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs">{error.index}</TableCell>
                              <TableCell className="font-mono text-xs">{error.sku}</TableCell>
                              <TableCell className="text-sm text-red-600">{error.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.products && uploadResult.products.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Exitosos ({uploadResult.products.length})</p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50">
                          <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-20">Cantidad</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.products.slice(0, 50).map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="text-xs">#{product.id}</TableCell>
                              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                              <TableCell className="text-sm">{product.name}</TableCell>
                              <TableCell className="text-sm">{product.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {uploadResult.products.length > 50 && (
                      <div className="p-2 bg-gray-50 border-t text-center text-xs text-gray-600">
                        Mostrando 50 de {uploadResult.products.length}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleClose} className="bg-[#006A4E] hover:bg-[#005741]">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}