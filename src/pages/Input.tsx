
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { getDatasets, deleteDataset } from '@/lib/db';
import { DataSet } from '@/types';
import { LineChart, CalendarDays, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
    <div className="min-h-full py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="text-3xl font-bold">Upload Data</h1>
            <p className="text-muted-foreground mt-1">
              Import your CSV files to visualize data patterns and insights
            </p>
          </div>
          
          {selectedDataset && (
            <Button onClick={handleViewGraph} className="gap-2">
              <LineChart className="h-4 w-4" />
              Create Visualizations
            </Button>
          )}
        </div>
        
        <div className="space-y-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p className="text-muted-foreground">Loading datasets...</p>
            </div>
          ) : datasets.length > 0 ? (
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Datasets</h2>
                <div className="text-sm text-muted-foreground bg-secondary rounded-full px-3 py-0.5">
                  {datasets.length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {datasets.map((dataset) => (
                  <div 
                    key={dataset.id}
                    className={`group relative bg-card rounded-xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md ${
                      selectedDataset?.id === dataset.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <h3 className="font-medium truncate pr-6">{dataset.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dataset.data.length} records, {dataset.columns.length} columns
                        </p>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                    
                    <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-8 text-center animate-fade-up">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Datasets Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload your first dataset using the form above to get started.
              </p>
            </div>
          )}
          
          {selectedDataset && (
            <div className="animate-fade-up mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedDataset.name}</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewGraph}
                  className="gap-2"
                >
                  <LineChart className="h-4 w-4" />
                  Create Visualizations
                </Button>
              </div>
              
              <DataTable dataset={selectedDataset} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;
