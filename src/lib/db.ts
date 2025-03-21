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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to upload data');
      return null;
    }
    
    const { data: insertResult, error } = await supabase
      .from('user_uploads')
      .insert({
        name,
        columns: columns as any, // Cast to any to bypass type checking
        data: data as any, // Cast to any to bypass type checking
        user_id: user.id
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding dataset to Supabase:", error);
      toast.error("Failed to save dataset to the database");
      return null;
    }
    
    // Parse the columns and data from the response
    const dataset: DataSet = {
      id: insertResult.id,
      name: insertResult.name,
      columns: insertResult.columns as unknown as Column[],
      data: insertResult.data as unknown as TravelData[],
      createdAt: new Date(insertResult.created_at),
      userId: insertResult.user_id
    };
    
    return dataset;
  } catch (error) {
    console.error("Error adding dataset:", error);
    toast.error("Failed to save dataset");
    return null;
  }
};

// Get all datasets from Supabase - modified to only get current user's datasets
export const getDatasets = async (): Promise<DataSet[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    const { data, error } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('user_id', user.id) // Only get datasets for the current user
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching datasets from Supabase:", error);
      toast.error("Failed to fetch datasets from the database");
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      columns: item.columns as unknown as Column[],
      data: item.data as unknown as TravelData[],
      createdAt: new Date(item.created_at),
      userId: item.user_id
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
      columns: data.columns as unknown as Column[],
      data: data.data as unknown as TravelData[],
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

// Delete a dataset by ID
export const deleteDataset = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_uploads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting dataset:", error);
      toast.error("Failed to delete dataset");
      return false;
    }
    
    toast.success("Dataset deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting dataset:", error);
    toast.error("Failed to delete dataset");
    return false;
  }
};
