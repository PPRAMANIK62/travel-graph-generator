import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import ManualDataInput from '@/components/ManualDataInput';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { getDatasets, deleteDataset } from '@/lib/db';
import { DataSet } from '@/types';
import { LineChart, CalendarDays, Trash2, AlertCircle, Upload, Plus, BarChart3, FileText, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Input = () => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const allDatasets = await getDatasets();
      setDatasets(allDatasets);
      
      // Select the most recent dataset if no dataset is selected
      if (allDatasets.length > 0 && !selectedDataset) {
        setSelectedDataset(allDatasets[0]);
      } else if (selectedDataset) {
        // Make sure selected dataset still exists
        const stillExists = allDatasets.find(d => d.id === selectedDataset.id);
        if (!stillExists) {
          setSelectedDataset(allDatasets.length > 0 ? allDatasets[0] : null);
        }
      }
    } catch (error) {
      console.error("Error loading datasets:", error);
      toast.error("Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleUploadSuccess = () => {
    loadDatasets();
  };

  const handleViewGraph = () => {
    if (selectedDataset) {
      navigate('/plot', { state: { datasetId: selectedDataset.id } });
    }
  };
  
  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;
    
    const success = await deleteDataset(datasetToDelete);
    if (success) {
      // Remove the dataset from the list
      if (selectedDataset?.id === datasetToDelete) {
        setSelectedDataset(null);
      }
      setDatasetToDelete(null);
      loadDatasets();
    }
  };

  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold">Data Management</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Import and manage your datasets for visualization
            </p>
          </div>
          
          {selectedDataset && (
            <Button 
              onClick={handleViewGraph} 
              size="sm"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Create Visualizations
            </Button>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border/60 shadow-sm p-5">
            <h2 className="text-sm font-medium mb-4">Add New Dataset</h2>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  Manual Input
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </TabsContent>
              
              <TabsContent value="manual">
                <ManualDataInput onDataCreated={handleUploadSuccess} />
              </TabsContent>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-6 bg-white rounded-lg border border-border/60 shadow-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : datasets.length > 0 ? (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Your Datasets</h2>
                  <div className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {datasets.length}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {datasets.map((dataset) => (
                  <div 
                    key={dataset.id}
                    className={cn(
                      "dataset-card group",
                      selectedDataset?.id === dataset.id ? "selected" : ""
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <LineChart className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-medium truncate">{dataset.name}</h3>
                        </div>
                        
                        <div className="flex gap-3 mt-3">
                          <div className="bg-secondary rounded-md px-2 py-1 text-xs">
                            {dataset.data.length} records
                          </div>
                          <div className="bg-secondary rounded-md px-2 py-1 text-xs">
                            {dataset.columns.length} columns
                          </div>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{dataset.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                setDatasetToDelete(dataset.id);
                                handleDeleteDataset();
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="flex items-center mt-4 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(dataset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border/60 rounded-lg p-8 text-center animate-fade-up shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-medium mb-2">No Datasets Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Upload your first dataset using the form above to get started.
              </p>
            </div>
          )}
          
          {selectedDataset && (
            <div className="animate-fade-up">
              <div className="bg-white rounded-lg border border-border/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">{selectedDataset.name}</h2>
                    <div className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {selectedDataset.data.length} rows
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewGraph}
                    className="gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Visualize
                  </Button>
                </div>
                
                <div className="border border-border/60 rounded-lg overflow-hidden">
                  <DataTable dataset={selectedDataset} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;
