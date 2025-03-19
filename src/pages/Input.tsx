import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { getDatasets } from '@/lib/db';
import { DataSet } from '@/types';
import { LineChart, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const Input = () => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const allDatasets = await getDatasets();
      setDatasets(allDatasets);
      
      // Select the most recent dataset if no dataset is selected
      if (allDatasets.length > 0 && !selectedDataset) {
        setSelectedDataset(allDatasets[0]);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-bold">Upload Travel Data</h1>
              <p className="text-muted-foreground mt-1">
                Import your CSV files to visualize travel patterns and insights
              </p>
            </div>
            
            {selectedDataset && (
              <Button onClick={handleViewGraph} className="gap-2">
                <LineChart className="h-4 w-4" />
                Create Graphs
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
                      className={`group relative bg-card rounded-xl p-5 border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedDataset?.id === dataset.id
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : ''
                      }`}
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium truncate pr-6">{dataset.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {dataset.data.length} records, {dataset.columns.length} columns
                          </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
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
            ) : null}
            
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
                    Create Graph
                  </Button>
                </div>
                
                <DataTable dataset={selectedDataset} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Input;
