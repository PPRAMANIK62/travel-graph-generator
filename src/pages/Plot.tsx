
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Graph from '@/components/Graph';
import { Button } from '@/components/ui/button';
import { getDatasets, getDatasetById } from '@/lib/db';
import { DataSet } from '@/types';
import { BarChart, Upload, MoveLeft, LineChart, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    <div className="min-h-full p-6 md:p-8">
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
              <Upload className="h-4 w-4" />
              Upload Data
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-6 bg-white rounded-lg border border-border/60 shadow-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : datasets.length === 0 ? (
            <div className="bg-white border border-border/60 rounded-lg p-8 text-center animate-fade-up shadow-sm">
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
              <div className="animate-fade-up bg-white rounded-lg border border-border/60 shadow-sm p-6">
                <h2 className="text-sm font-medium mb-4">Select Dataset</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={cn(
                        "dataset-card cursor-pointer group",
                        selectedDataset?.id === dataset.id ? "selected" : ""
                      )}
                      onClick={() => handleSelectDataset(dataset)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <LineChart className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-medium truncate">{dataset.name}</h3>
                        </div>
                        
                        <ChevronRight className={cn(
                          "h-4 w-4 text-muted-foreground transition-all",
                          selectedDataset?.id === dataset.id ? "text-primary" : "opacity-0 group-hover:opacity-100"
                        )} />
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
                  ))}
                </div>
              </div>
              
              {selectedDataset && (
                <div className="animate-fade-up bg-white rounded-lg border border-border/60 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-medium">Create Visualization</h2>
                    <div className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {selectedDataset.name}
                    </div>
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
