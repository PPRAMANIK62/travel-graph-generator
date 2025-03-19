
import { toast } from 'sonner';
import { DataSet, TravelData, Column, SupabaseDataSet } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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

// Add a new dataset to Supabase
export const addDataset = async (name: string, data: TravelData[], columns: Column[]): Promise<DataSet | null> => {
  try {
    const { data: insertResult, error } = await supabase
      .from('user_uploads')
      .insert({
        name,
        columns,
        data
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding dataset to Supabase:", error);
      toast.error("Failed to save dataset to the database");
      return null;
    }
    
    const dataset: DataSet = {
      id: insertResult.id,
      name: insertResult.name,
      columns: insertResult.columns,
      data: insertResult.data,
      createdAt: new Date(insertResult.created_at)
    };
    
    return dataset;
  } catch (error) {
    console.error("Error adding dataset:", error);
    toast.error("Failed to save dataset");
    return null;
  }
};

// Get all datasets from Supabase
export const getDatasets = async (): Promise<DataSet[]> => {
  try {
    const { data, error } = await supabase
      .from('user_uploads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching datasets from Supabase:", error);
      toast.error("Failed to fetch datasets from the database");
      return [];
    }
    
    return data.map((item: SupabaseDataSet) => ({
      id: item.id,
      name: item.name,
      columns: item.columns,
      data: item.data,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error("Error fetching datasets:", error);
    toast.error("Failed to fetch datasets");
    return [];
  }
};

// Get a dataset by ID from Supabase
export const getDatasetById = async (id: string): Promise<DataSet | undefined> => {
  try {
    const { data, error } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching dataset by ID from Supabase:", error);
      toast.error("Failed to fetch dataset");
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      columns: data.columns,
      data: data.data,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error("Error fetching dataset by ID:", error);
    toast.error("Failed to fetch dataset");
    return undefined;
  }
};

// Get columns from a dataset
export const getColumns = async (datasetId: string): Promise<Column[]> => {
  const dataset = await getDatasetById(datasetId);
  return dataset?.columns || [];
};

// Get data for specific columns
export const getDataForColumns = async (datasetId: string, xColumn: string, yColumn: string): Promise<{ x: any; y: any; }[]> => {
  const dataset = await getDatasetById(datasetId);
  if (!dataset) return [];
  
  return dataset.data.map(item => ({
    x: item[xColumn],
    y: item[yColumn]
  }));
};
