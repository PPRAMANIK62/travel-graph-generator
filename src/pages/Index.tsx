
import { Link } from 'react-router-dom';
import { BarChart3, LineChart, PieChart, UploadCloud, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { session } = useAuth();

  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Your Data into Beautiful Visualizations
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Upload your CSV files and create stunning graphs and charts in seconds. Analyze patterns, discover insights, and make data-driven decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to={session ? "/input" : "/auth"}>
                    <Button size="lg" className="gap-2">
                      <UploadCloud className="h-5 w-5" />
                      {session ? "Upload Data" : "Get Started"}
                    </Button>
                  </Link>
                  <Link to={session ? "/plot" : "/auth"}>
                    <Button size="lg" variant="outline" className="gap-2">
                      <BarChart3 className="h-5 w-5" />
                      View Visualizations
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                  <div className="grid gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 shadow-sm">
                      <LineChart className="h-12 w-12 text-indigo-500" />
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 p-8 shadow-sm">
                      <BarChart3 className="h-12 w-12 text-rose-500" />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 shadow-sm">
                      <PieChart className="h-12 w-12 text-blue-500" />
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 p-8 shadow-sm">
                      <Layers className="h-12 w-12 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powerful Data Visualization Tools
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Graphify provides all the tools you need to transform your data into meaningful visualizations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy Data Upload</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Simply drag and drop your CSV files or use our file picker to get started.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Versatile Chart Types</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create line charts, bar charts, scatter plots, pie charts and more with just a few clicks.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Data Management</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Organize, edit, and manage your datasets securely in one place.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link to={session ? "/input" : "/auth"}>
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
