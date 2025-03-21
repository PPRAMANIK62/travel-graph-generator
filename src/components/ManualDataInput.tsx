
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addDataset, parseCSV } from '@/lib/db';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Column, TravelData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Table, Eye, EyeOff } from 'lucide-react';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  datasetName: z.string().min(1, { message: "Dataset name is required" }),
  columnNames: z.array(z.string().min(1, { message: "Column name is required" })),
  columnTypes: z.array(z.enum(["string", "number", "date", "boolean"])),
  rawData: z.string().min(1, { message: "Data is required" })
});

interface ManualDataInputProps {
  onDataCreated: () => void;
}

const ManualDataInput = ({ onDataCreated }: ManualDataInputProps) => {
  const [columns, setColumns] = useState<{name: string, type: string}[]>([
    { name: '', type: 'string' },
    { name: '', type: 'number' }
  ]);
  const [previewData, setPreviewData] = useState<TravelData[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datasetName: '',
      columnNames: ['', ''],
      columnTypes: ['string', 'number'],
      rawData: ''
    }
  });

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'string' }]);
    form.setValue('columnNames', [...form.getValues('columnNames'), '']);
    form.setValue('columnTypes', [...form.getValues('columnTypes'), 'string']);
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 2) {
      toast.error("You need at least two columns");
      return;
    }
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
    
    const newNames = [...form.getValues('columnNames')];
    newNames.splice(index, 1);
    form.setValue('columnNames', newNames);
    
    const newTypes = [...form.getValues('columnTypes')];
    newTypes.splice(index, 1);
    form.setValue('columnTypes', newTypes);
  };

  const handleColumnNameChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].name = value;
    setColumns(newColumns);
    
    const newNames = [...form.getValues('columnNames')];
    newNames[index] = value;
    form.setValue('columnNames', newNames);
  };

  const handleColumnTypeChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].type = value;
    setColumns(newColumns);
    
    const newTypes = [...form.getValues('columnTypes')];
    newTypes[index] = value as "string" | "number" | "date" | "boolean";
    form.setValue('columnTypes', newTypes);
  };

  const parseManualData = (rawData: string, columnNames: string[], columnTypes: string[]): { data: TravelData[], columns: Column[] } => {
    try {
      const rows = rawData.trim().split('\n');
      const data: TravelData[] = [];
      
      // Process each row
      rows.forEach((row, rowIndex) => {
        const values = row.split(',').map(v => v.trim());
        
        if (values.length !== columnNames.length) {
          return;
        }
        
        const rowData: TravelData = { id: `row-${rowIndex}` };
        
        // Add each column value with appropriate type conversion
        columnNames.forEach((columnName, colIndex) => {
          if (!columnName) return;
          
          const value = values[colIndex];
          const type = columnTypes[colIndex];
          
          if (type === 'number' && !isNaN(Number(value))) {
            rowData[columnName] = Number(value);
          } else if (type === 'boolean') {
            rowData[columnName] = value.toLowerCase() === 'true';
          } else if (type === 'date') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              rowData[columnName] = value; // Store as string for consistency
            } else {
              rowData[columnName] = value;
            }
          } else {
            rowData[columnName] = value;
          }
        });
        
        data.push(rowData);
      });
      
      // Create columns metadata
      const columns: Column[] = columnNames.map((name, index) => {
        if (!name) return { name: '', label: '', type: 'string' as "string" | "number" | "date" | "boolean" };
        return {
          name,
          label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: columnTypes[index] as "string" | "number" | "date" | "boolean"
        };
      }).filter(col => col.name !== '');
      
      return { data, columns };
    } catch (error) {
      console.error("Error parsing manual data:", error);
      return { data: [], columns: [] };
    }
  };

  // Update preview data whenever form values change
  useEffect(() => {
    const rawData = form.watch('rawData');
    const columnNames = form.watch('columnNames');
    const columnTypes = form.watch('columnTypes');
    
    if (rawData && columnNames.some(name => name)) {
      const { data } = parseManualData(rawData, columnNames, columnTypes);
      setPreviewData(data);
    } else {
      setPreviewData([]);
    }
  }, [form.watch('rawData'), form.watch('columnNames'), form.watch('columnTypes')]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.datasetName.trim()) {
      toast.error("Dataset name is required");
      return;
    }
    
    // Validate column names are unique
    const uniqueNames = new Set(values.columnNames.filter(Boolean));
    if (uniqueNames.size !== values.columnNames.filter(Boolean).length) {
      toast.error("Column names must be unique");
      return;
    }
    
    // Parse the manual data
    const { data, columns } = parseManualData(
      values.rawData,
      values.columnNames,
      values.columnTypes
    );
    
    if (data.length === 0) {
      toast.error("No valid data to save");
      return;
    }
    
    // Save the dataset
    const result = await addDataset(values.datasetName, data, columns);
    
    if (result) {
      toast.success("Dataset created successfully");
      form.reset();
      onDataCreated();
    } else {
      toast.error("Failed to create dataset");
    }
  };

  const validColumnNames = columns.filter(col => col.name).map(col => col.name);
  const hasValidColumns = validColumnNames.length > 0;

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          Manual Input
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="manual" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="datasetName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dataset Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Dataset" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Define Columns</h3>
                    <Button 
                      type="button" 
                      onClick={addColumn} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Column
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {columns.map((column, index) => (
                      <div key={index} className="grid grid-cols-8 gap-2 items-start">
                        <div className="col-span-4">
                          <Label htmlFor={`column-name-${index}`}>Name</Label>
                          <Input
                            id={`column-name-${index}`}
                            value={column.name}
                            onChange={(e) => handleColumnNameChange(index, e.target.value)}
                            placeholder="Column name"
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <Label htmlFor={`column-type-${index}`}>Type</Label>
                          <Select
                            value={column.type}
                            onValueChange={(value) => handleColumnTypeChange(index, value)}
                          >
                            <SelectTrigger id={`column-type-${index}`}>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-1 pt-7">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeColumn(index)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="rawData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data (CSV format)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`value1,value2,value3\nvalue4,value5,value6`}
                          className="min-h-[150px] font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter data in CSV format (comma-separated values), one row per line.
                        Each row should have the same number of values as columns defined above.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Create Dataset</Button>
              </form>
            </Form>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Data Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
            
            {showPreview && (
              <div className={cn(
                "border rounded-md overflow-hidden",
                (!hasValidColumns || previewData.length === 0) ? "border-dashed" : ""
              )}>
                {hasValidColumns ? (
                  <div className="overflow-x-auto max-h-[400px]">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          {validColumnNames.map((name) => (
                            <TableHead key={name}>{name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.length > 0 ? (
                          previewData.map((row, index) => (
                            <TableRow key={`row-${index}`}>
                              {validColumnNames.map((name) => (
                                <TableCell key={`${index}-${name}`}>
                                  {row[name] !== undefined ? String(row[name]) : ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={validColumnNames.length} className="h-24 text-center text-muted-foreground">
                              No data available. Start entering data in CSV format.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Table className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>Define at least one column to see data preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ManualDataInput;
