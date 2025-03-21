
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Graph from '@/components/Graph';
import { Button } from '@/components/ui/button';
import { getDatasets, getDatasetById } from '@/lib/db';
import { DataSet } from '@/types';
import { BarChart, Upload, MoveLeft, LineChart, ChevronRight, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Plot = () => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allDatasets = await getDatasets();
        setDatasets(allDatasets);
        
        // Check if we have a datasetId from navigation state
        const locationState = location.state as { datasetId?: string } | null;
        
        if (locationState?.datasetId) {
          const dataset = await getDatasetById(locationState.datasetId);
          if (dataset) {
            setSelectedDataset(dataset);
          }
        } else if (allDatasets.length > 0) {
          // Select the first dataset if no dataset is selected
          setSelectedDataset(allDatasets[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch datasets");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [location.state]);

  const handleUploadClick = () => {
    navigate('/input');
  };
  
  const handleSelectDataset = (dataset: DataSet) => {
    setSelectedDataset(dataset);
  };

  return (
    <div className="min-h-full p-6 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-semibold">Data Visualization</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create interactive charts from your datasets
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/input')}
              size="sm"
              className="gap-2"
            >
              <MoveLeft className="h-4 w-4" />
              Back to Data
            </Button>
            
            <Button 
              onClick={handleUploadClick}
              size="sm"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Dataset
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-6 bg-white rounded-lg border border-border/60 shadow-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : datasets.length === 0 ? (
            <div className="glass border border-border/60 rounded-lg p-8 text-center animate-fade-up shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-medium mb-2">No Datasets Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm mb-4">
                You need to upload some data before you can create visualizations.
              </p>
              <Button 
                onClick={handleUploadClick}
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Data
              </Button>
            </div>
          ) : (
            <>
              <div className="animate-fade-up glass rounded-lg border border-border/60 shadow-sm p-6">
                <h2 className="text-sm font-medium mb-4 text-primary/80">Select Dataset</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={cn(
                        "dataset-card cursor-pointer group hover:shadow-md transition-all duration-200",
                        selectedDataset?.id === dataset.id ? "selected bg-primary/5" : ""
                      )}
                      onClick={() => handleSelectDataset(dataset)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-8 w-8 rounded-md flex items-center justify-center",
                            selectedDataset?.id === dataset.id 
                              ? "bg-primary/20" 
                              : "bg-primary/10"
                          )}>
                            <LineChart className={cn(
                              "h-4 w-4",
                              selectedDataset?.id === dataset.id 
                                ? "text-primary" 
                                : "text-primary/70"
                            )} />
                          </div>
                          <div>
                            <h3 className="font-medium truncate">{dataset.name}</h3>
                            <p className="text-xs text-muted-foreground">{new Date(dataset.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all",
                          selectedDataset?.id === dataset.id ? "text-primary" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                        )} />
                      </div>
                      
                      <div className="flex gap-3 mt-3">
                        <Badge variant="outline" className="bg-secondary/50">
                          {dataset.data.length} records
                        </Badge>
                        <Badge variant="outline" className="bg-secondary/50">
                          {dataset.columns.length} columns
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedDataset && (
                <div className="animate-fade-up glass rounded-lg border border-border/60 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-medium text-primary/80">Create Visualization</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {selectedDataset.name}
                    </Badge>
                  </div>
                  <Graph 
                    datasetId={selectedDataset.id} 
                    columns={selectedDataset.columns} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plot;
