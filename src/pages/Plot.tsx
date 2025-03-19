
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Graph from '@/components/Graph';
import { Button } from '@/components/ui/button';
import { getDatasets, getDatasetById } from '@/lib/db';
import { DataSet } from '@/types';
import { BarChart, Upload, MoveLeft } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-bold">Create Visualizations</h1>
              <p className="text-muted-foreground mt-1">
                Generate interactive charts from your travel data
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <MoveLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button 
                onClick={handleUploadClick}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload More Data
              </Button>
            </div>
          </div>
          
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p className="text-muted-foreground">Loading datasets...</p>
              </div>
            ) : datasets.length === 0 ? (
              <div className="bg-card border rounded-xl p-10 text-center animate-fade-up">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Datasets Available</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  You need to upload some data before you can create visualizations.
                </p>
                <Button 
                  onClick={handleUploadClick}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Data
                </Button>
              </div>
            ) : (
              <>
                <div className="animate-fade-up">
                  <h2 className="text-xl font-semibold mb-4">Select Dataset</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {datasets.map((dataset) => (
                      <div
                        key={dataset.id}
                        className={`relative bg-card rounded-xl p-5 border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedDataset?.id === dataset.id
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : ''
                        }`}
                        onClick={() => handleSelectDataset(dataset)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{dataset.name}</h3>
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <BarChart className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dataset.data.length} records, {dataset.columns.length} columns
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedDataset && (
                  <div className="animate-fade-up">
                    <h2 className="text-xl font-semibold mb-4">Create Graph</h2>
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
      </main>
    </div>
  );
};

export default Plot;
