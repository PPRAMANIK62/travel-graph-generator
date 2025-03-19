
import { toast } from 'sonner';
import { DataSet, TravelData, Column } from '@/types';

// In-memory database for now
let datasets: DataSet[] = [];
let currentId = 0;

// Infer column types from data
const inferColumnType = (value: any): "string" | "number" | "date" | "boolean" => {
  if (value === null || value === undefined || value === '') return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  
  // Check if it's a date
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime()) && typeof value === "string" && value.length > 5) {
    return "date";
  }
  
  // Check if it's a number in string format
  if (typeof value === "string" && !isNaN(Number(value))) {
    return "number";
  }
  
  return "string";
};

// Parse CSV data
export const parseCSV = (csvText: string): { data: TravelData[], columns: Column[] } => {
  try {
    const lines = csvText.split('\n');
    if (lines.length < 2) throw new Error("CSV file must have headers and at least one row of data");
    
    // Extract headers
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Parse data rows
    const parsedData: TravelData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',');
      if (values.length !== headers.length) {
        console.warn(`Row ${i} has ${values.length} values, expected ${headers.length}. Skipping.`);
        continue;
      }
      
      const rowData: TravelData = { id: `row-${i}` };
      headers.forEach((header, index) => {
        let value = values[index].trim();
        // Convert numeric strings to numbers
        if (!isNaN(Number(value)) && value !== '') {
          rowData[header] = Number(value);
        } else {
          rowData[header] = value;
        }
      });
      
      parsedData.push(rowData);
    }
    
    // Infer column types by examining the first row of data
    const columns: Column[] = headers.map(header => {
      const firstValue = parsedData[0]?.[header];
      const type = inferColumnType(firstValue);
      return {
        name: header,
        label: header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type
      };
    });
    
    return { data: parsedData, columns };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    toast.error("Failed to parse CSV file. Please check the format.");
    return { data: [], columns: [] };
  }
};

// Add a new dataset
export const addDataset = (name: string, data: TravelData[], columns: Column[]): DataSet => {
  const id = `dataset-${++currentId}`;
  const dataset: DataSet = {
    id,
    name,
    columns,
    data,
    createdAt: new Date()
  };
  
  datasets.push(dataset);
  return dataset;
};

// Get all datasets
export const getDatasets = (): DataSet[] => {
  return datasets;
};

// Get a dataset by ID
export const getDatasetById = (id: string): DataSet | undefined => {
  return datasets.find(dataset => dataset.id === id);
};

// Get columns from a dataset
export const getColumns = (datasetId: string): Column[] => {
  const dataset = getDatasetById(datasetId);
  return dataset?.columns || [];
};

// Get data for specific columns
export const getDataForColumns = (datasetId: string, xColumn: string, yColumn: string): { x: any; y: any; }[] => {
  const dataset = getDatasetById(datasetId);
  if (!dataset) return [];
  
  return dataset.data.map(item => ({
    x: item[xColumn],
    y: item[yColumn]
  }));
};

// Clear data (for testing)
export const clearData = (): void => {
  datasets = [];
  currentId = 0;
};
