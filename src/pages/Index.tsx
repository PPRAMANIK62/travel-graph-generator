
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { LineChart, UploadCloud, Sparkles, MoveRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto animate-fade-up">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
            <LineChart className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Travel Data Visualization
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Upload your travel data and create beautiful, interactive visualizations
            with just a few clicks. Analyze trends and gain insights from your data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/input')}
              className="gap-2"
            >
              <UploadCloud className="h-5 w-5" />
              Upload Data
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/plot')} 
              className="gap-2"
            >
              <LineChart className="h-5 w-5" />
              Create Graphs
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-up">
          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Easy Data Upload</h3>
            <p className="text-muted-foreground">
              Import your travel data quickly using our CSV uploader. Our system automatically detects data types and column formats.
            </p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Dynamic Visualizations</h3>
            <p className="text-muted-foreground">
              Create beautiful charts and graphs with customizable axes. Select any data column to visualize relationships and patterns.
            </p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Multiple Chart Types</h3>
            <p className="text-muted-foreground">
              Choose from line charts, bar graphs, scatter plots, and pie charts to best represent your travel data and insights.
            </p>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/input')}
            className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
          >
            Get Started
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
      
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TravelGraph. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
