
import { useState, useEffect } from 'react';
import { getDataForColumns } from '@/lib/db';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, BarChart, Bar, 
  ScatterChart, Scatter, PieChart, Pie, Cell, Label 
} from 'recharts';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface GraphProps {
  datasetId: string;
  columns: { name: string; label: string; type: string }[];
}

type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', 
  '#10b981', '#06b6d4', '#3b82f6', '#f97316', '#0ea5e9'
];

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
  
  const handleGenerateGraph = async () => {
    if (!xColumn || !yColumn) {
      toast.error('Please select both X and Y axes');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getDataForColumns(datasetId, xColumn, yColumn);
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
        <div className="flex flex-col items-center justify-center h-full gap-2 p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChartIcon className="h-6 w-6 text-primary/70" />
          </div>
          <p className="text-muted-foreground">Select axes and generate a graph</p>
        </div>
      );
    }
    
    const xLabel = columns.find(col => col.name === xColumn)?.label || xColumn;
    const yLabel = columns.find(col => col.name === yColumn)?.label || yColumn;
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <defs>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="x" 
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label
                  value={xLabel}
                  position="bottom"
                  offset={15}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                />
              </XAxis>
              <YAxis 
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label 
                  value={yLabel}
                  position="left"
                  angle={-90}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                  offset={-5}
                />
              </YAxis>
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value, yLabel]} 
                labelFormatter={(label) => `${xLabel}: ${typeof label === 'number' ? label.toLocaleString() : label}`}
                contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="y" 
                name={yLabel}
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }} 
                activeDot={{ r: 6, fill: '#4f46e5' }} 
                animationDuration={1500}
                fillOpacity={1}
                fill="url(#colorY)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="x" 
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label
                  value={xLabel}
                  position="bottom"
                  offset={15}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                />
              </XAxis>
              <YAxis 
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label 
                  value={yLabel}
                  position="left"
                  angle={-90}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                  offset={-5}
                />
              </YAxis>
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value, yLabel]} 
                labelFormatter={(label) => `${xLabel}: ${typeof label === 'number' ? label.toLocaleString() : label}`}
                contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="y" 
                name={yLabel} 
                fill="url(#barGradient)" 
                animationDuration={1500} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="x" 
                name={xLabel}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label
                  value={xLabel}
                  position="bottom"
                  offset={15}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                />
              </XAxis>
              <YAxis 
                dataKey="y" 
                name={yLabel}
                tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                stroke="#94a3b8"
                fontSize={12}
              >
                <Label 
                  value={yLabel}
                  position="left"
                  angle={-90}
                  style={{ textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }}
                  offset={-5}
                />
              </YAxis>
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Scatter 
                data={chartData} 
                name={`${xLabel} vs ${yLabel}`} 
                fill="#ec4899" 
                fillOpacity={0.7}
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
                label={({ name, value, percent }) => 
                  `${name}: ${typeof value === 'number' ? value.toLocaleString() : value} (${(percent * 100).toFixed(0)}%)`
                }
                animationDuration={1500}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]} 
                contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-up">
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/80">Chart Type</label>
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
              <label className="text-sm font-medium text-primary/80">X-Axis</label>
              <Select value={xColumn} onValueChange={setXColumn}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {columns.map((column) => (
                    <SelectItem key={column.name} value={column.name || 'default'}>
                      <div className="flex items-center gap-2">
                        {column.label}
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          {column.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/80">Y-Axis</label>
              <Select value={yColumn} onValueChange={setYColumn}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {numericColumns.length > 0 
                    ? numericColumns.map((column) => (
                        <SelectItem key={column.name} value={column.name || 'default'}>
                          <div className="flex items-center gap-2">
                            {column.label}
                            <Badge variant="outline" className="text-xs py-0 h-5">
                              {column.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    : columns.map((column) => (
                        <SelectItem key={column.name} value={column.name || 'default'}>
                          <div className="flex items-center gap-2">
                            {column.label}
                            <Badge variant="outline" className="text-xs py-0 h-5">
                              {column.type}
                            </Badge>
                          </div>
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
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span className="ml-2">Generating...</span>
                  </>
                ) : (
                  <>Generate Graph</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="glass rounded-xl border border-border/40 shadow-sm animate-fade-in overflow-hidden">
        <div className="h-[450px] p-4">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default Graph;
