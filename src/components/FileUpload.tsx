import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { parseCSV, addDataset } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    setFile(file);
    setDatasetName(file.name.replace('.csv', ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!datasetName.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }

    setIsUploading(true);
    
    try {
      const fileContent = await file.text();
      const { data, columns } = parseCSV(fileContent);
      
      if (data.length === 0) {
        toast.error('No data found in the CSV file');
        setIsUploading(false);
        return;
      }
      
      const result = await addDataset(datasetName, data, columns);
      if (result) {
        toast.success('Data uploaded successfully', {
          description: `Loaded ${data.length} records with ${columns.length} columns`
        });
        
        // Reset form
        setFile(null);
        setDatasetName('');
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setDatasetName('');
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="space-y-6 animate-fade-up">
        {!file && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out ${
              isDragging ? 'bg-primary/5 border-primary' : 'bg-secondary/50 border-muted'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Select File
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}
        
        {file && (
          <div className="animate-scale-in">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input
                  id="dataset-name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !datasetName.trim()}
                >
                  {isUploading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <p>Make sure your CSV file has headers in the first row</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
