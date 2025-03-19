
export interface TravelData {
  id: string;
  [key: string]: any;
}

export interface Column {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
}

export interface DataSet {
  id: string;
  name: string;
  columns: Column[];
  data: TravelData[];
  createdAt: Date;
}

export interface SupabaseDataSet {
  id: string;
  name: string;
  columns: Column[];
  data: TravelData[];
  created_at: string;
}
