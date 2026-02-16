import {
  createWorkbook,
  addSheetFromAoa,
  addSheetFromJson,
  downloadWorkbook,
  loadWorkbook,
  findSheetByName,
  readSheetToJson,
} from './excel';

// Datos de ejemplo para la plantilla
export const TEMPLATE_DATA = [
  {
    'Nombre del Material': 'Harina de Maíz',
    'Código': 'MAT-001',
    'Tipo': 'raw',
    'Unidad de Medida': 'kg',
    'Costo por Unidad': 2.50,
    'Proveedor': 'Proveedor ABC S.A.',
    'Stock Mínimo': 100
  },
  {
    'Nombre del Material': 'Aceite Vegetal',
    'Código': 'MAT-002',
    'Tipo': 'raw',
    'Unidad de Medida': 'L',
    'Costo por Unidad': 3.75,
    'Proveedor': 'Proveedor XYZ S.A.',
    'Stock Mínimo': 50
  },
  {
    'Nombre del Material': 'Bolsa Plástica 500g',
    'Código': 'EMP-001',
    'Tipo': 'packaging',
    'Unidad de Medida': 'unidad',
    'Costo por Unidad': 0.15,
    'Proveedor': 'Empaques S.A.',
    'Stock Mínimo': 1000
  }
];

// Instrucciones para el usuario
export const INSTRUCTIONS = `INSTRUCCIONES PARA CARGA MASIVA DE MATERIALES

1. COLUMNAS REQUERIDAS (en este orden):
   - Nombre del Material (texto)
   - Código (texto único)
   - Tipo (raw, packaging, o other)
   - Unidad de Medida (kg, L, g, ml, unidad, lb, m, m²)
   - Costo por Unidad (número decimal)
   - Proveedor (texto)
   - Stock Mínimo (número decimal)

2. TIPOS DE MATERIAL PERMITIDOS:
   - raw: Materia Prima
   - packaging: Empaque
   - other: Otro

3. UNIDADES DE MEDIDA PERMITIDAS:
   - kg (kilogramos)
   - L (litros)
   - g (gramos)
   - ml (mililitros)
   - unidad
   - lb (libras)
   - m (metros)
   - m² (metros cuadrados)

4. NOTAS IMPORTANTES:
   - Si un material con el mismo código ya existe, se actualizará
   - Los códigos duplicados dentro del mismo archivo se marcarán como fallidos
   - Todos los campos son obligatorios
   - El costo y stock mínimo deben ser números positivos
   - Máximo 1000 materiales por carga

5. EJEMPLO DE DATOS:
   Ver las filas de ejemplo en la pestaña "Datos de Ejemplo"
`;

const MATERIAL_COLUMN_WIDTHS = [25, 15, 15, 20, 18, 25, 15];

/**
 * Genera y descarga un archivo Excel con la plantilla de materiales
 */
export async function downloadExcelTemplate() {
  const wb = createWorkbook();
  addSheetFromAoa(
    wb,
    'Instrucciones',
    INSTRUCTIONS.split('\n').map((line) => [line])
  );
  addSheetFromJson(wb, 'Datos de Ejemplo', TEMPLATE_DATA as Record<string, unknown>[], MATERIAL_COLUMN_WIDTHS);
  addSheetFromJson(
    wb,
    'Mis Materiales',
    [
      {
        'Nombre del Material': '',
        'Código': '',
        'Tipo': '',
        'Unidad de Medida': '',
        'Costo por Unidad': '',
        'Proveedor': '',
        'Stock Mínimo': '',
      },
    ] as Record<string, unknown>[],
    MATERIAL_COLUMN_WIDTHS
  );
  await downloadWorkbook(wb, 'Plantilla_Materiales_Nutregam.xlsx');
}

/**
 * Genera y descarga un archivo CSV con la plantilla de materiales
 */
export function downloadCSVTemplate() {
  const headers = [
    'Nombre del Material',
    'Código',
    'Tipo',
    'Unidad de Medida',
    'Costo por Unidad',
    'Proveedor',
    'Stock Mínimo'
  ];

  const rows = TEMPLATE_DATA.map(item => [
    item['Nombre del Material'],
    item['Código'],
    item['Tipo'],
    item['Unidad de Medida'],
    item['Costo por Unidad'],
    item['Proveedor'],
    item['Stock Mínimo']
  ]);

  // Crear el contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escapar comillas y valores con comas
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Crear un blob y descargarlo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'Plantilla_Materiales_Nutregam.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Lee un archivo Excel y retorna un array de materiales
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const workbook = await loadWorkbook(buffer);
  const sheetName =
    findSheetByName(workbook, ['mis materiales', 'materiales']) ??
    workbook.worksheets.find(
      (ws) =>
        ws.name !== 'Instrucciones' && ws.name !== 'Datos de Ejemplo'
    )?.name ??
    workbook.worksheets[0]?.name;
  if (!sheetName) return [];
  const jsonData = readSheetToJson(workbook, sheetName);
  return jsonData;
}

/**
 * Lee un archivo CSV y retorna un array de materiales
 */
export async function parseCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          reject(new Error('El archivo CSV está vacío o no tiene datos'));
          return;
        }

        // Parsear el header
        const headers = parseCSVLine(lines[0]);

        // Parsear las filas
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const obj: any = {};
          
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });

          return obj;
        });

        resolve(data);
      } catch (error) {
        reject(new Error('Error al leer el archivo CSV: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
}

/**
 * Parsea una línea CSV respetando las comillas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Comilla escapada
      current += '"';
      i++; // Saltar la siguiente comilla
    } else if (char === '"') {
      // Toggle estado de comillas
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Fin de campo
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Agregar el último campo
  result.push(current.trim());

  return result;
}

/**
 * Convierte los datos del archivo a formato CreateMaterialData
 */
export function convertToMaterialData(rawData: any[], defaultOriginId: string) {
  return rawData.map((row: any) => {
    // Normalizar nombres de columnas (soportar diferentes formatos)
    const name = row['Nombre del Material'] || row['Nombre'] || row['nombre'] || '';
    const code = row['Código'] || row['Codigo'] || row['codigo'] || row['Code'] || '';
    const type = row['Tipo'] || row['tipo'] || row['Type'] || 'raw';
    const unit = row['Unidad de Medida'] || row['Unidad'] || row['unidad'] || row['Unit'] || 'kg';
    const cost = Number.parseFloat(row['Costo por Unidad'] || row['Costo'] || row['costo'] || row['Cost'] || '0');
    const supplier = row['Proveedor'] || row['proveedor'] || row['Supplier'] || '';
    const minStock = Number.parseFloat(row['Stock Mínimo'] || row['Stock Minimo'] || row['Stock'] || row['stock'] || '0');

    return {
      material_name: name.toString().trim(),
      material_code: code.toString().trim(),
      material_type: type.toString().toLowerCase().trim(),
      idorigin: defaultOriginId,
      unit_of_measure: unit.toString().trim(),
      cost_per_unit: Number.isNaN(cost) ? 0 : cost,
      supplier: supplier.toString().trim(),
      minimum_stock: Number.isNaN(minStock) ? 0 : minStock,
    };
  }).filter(material => 
    // Filtrar filas vacías
    material.material_name && material.material_code
  );
}