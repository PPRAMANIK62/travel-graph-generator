
import { useState, useEffect } from 'react';
import { getDataForColumns } from '@/lib/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface GraphProps {
  datasetId: string;
  columns: { name: string; label: string; type: string }[];
}

type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A78BFA', '#F87171', '#60A5FA'];

const Graph = ({ datasetId, columns }: GraphProps) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const numericColumns = columns.filter(col => col.type === 'number');
  
  useEffect(() => {
    // Auto-select the first two numeric columns if available
    if (numericColumns.length >= 2 && !xColumn && !yColumn) {
      setXColumn(numericColumns[0].name);
      setYColumn(numericColumns[1].name);
    }
  }, [columns]);
  
  const handleGenerateGraph = () => {
    if (!xColumn || !yColumn) {
      toast.error('Please select both X and Y axes');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = getDataForColumns(datasetId, xColumn, yColumn);
      setChartData(data);
    } catch (error) {
      console.error('Error generating graph:', error);
      toast.error('Failed to generate graph');
    } finally {
      setIsLoading(false);
    }
  };
  
  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: <LineChartIcon className="h-4 w-4" /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon className="h-4 w-4" /> },
    { value: 'scatter', label: 'Scatter Plot', icon: <ScatterChartIcon className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon className="h-4 w-4" /> },
  ];
  
  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select axes and generate graph</p>
        </div>
      );
    }
    
    const xLabel = columns.find(col => col.name === xColumn)?.label || xColumn;
    const yLabel = columns.find(col => col.name === yColumn)?.label || yColumn;
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="x" 
                label={{ value: xLabel, position: 'bottom', offset: 20 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <YAxis 
                label={{ value: yLabel, angle: -90, position: 'left', offset: -10 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
                labelFormatter={(label) => `${xLabel}: ${typeof label === 'number' ? label.toLocaleString() : label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="y" 
                name={yLabel}
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
                animationDuration={1500} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="x" 
                label={{ value: xLabel, position: 'bottom', offset: 20 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <YAxis 
                label={{ value: yLabel, angle: -90, position: 'left', offset: -10 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
                labelFormatter={(label) => `${xLabel}: ${typeof label === 'number' ? label.toLocaleString() : label}`}
              />
              <Legend />
              <Bar 
                dataKey="y" 
                name={yLabel} 
                fill="#3b82f6" 
                animationDuration={1500} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="x" 
                name={xLabel}
                label={{ value: xLabel, position: 'bottom', offset: 20 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <YAxis 
                dataKey="y" 
                name={yLabel}
                label={{ value: yLabel, angle: -90, position: 'left', offset: -10 }}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
              />
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter 
                data={chartData} 
                name={`${xLabel} vs ${yLabel}`} 
                fill="#3b82f6" 
                fillOpacity={0.8}
                animationDuration={1500} 
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        const pieData = chartData.slice(0, 10).map((item, index) => ({
          name: item.x,
          value: item.y
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                animationDuration={1500}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-up">
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chart Type</label>
            <div className="flex flex-wrap gap-2">
              {chartTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={chartType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType(type.value as ChartType)}
                  className="flex items-center gap-1.5"
                >
                  {type.icon}
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">X-Axis</label>
            <Select value={xColumn} onValueChange={setXColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Y-Axis</label>
            <Select value={yColumn} onValueChange={setYColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.length > 0 
                  ? numericColumns.map((column) => (
                      <SelectItem key={column.name} value={column.name}>
                        {column.label}
                      </SelectItem>
                    ))
                  : columns.map((column) => (
                      <SelectItem key={column.name} value={column.name}>
                        {column.label}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleGenerateGraph} 
              disabled={!xColumn || !yColumn || isLoading}
              className="w-full"
            >
              Generate Graph
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border shadow-sm animate-fade-in overflow-hidden">
        <div className="h-[450px] p-4">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default Graph;
