import { useState } from "react";
import MatrixBackground from "@/components/MatrixBackground";
import MatrixInput from "@/components/MatrixInput";
import ResultsDisplay from "@/components/ResultsDisplay";
import { calculateEigen, EigenResult } from "@/lib/matrixCalculations";
import { toast } from "sonner";

const Index = () => {
  const [results, setResults] = useState<EigenResult | null>(null);

  const handleCalculate = (matrix: number[][]) => {
    try {
      const eigenResults = calculateEigen(matrix);
      setResults(eigenResults);
      toast.success("Calculation complete!", {
        description: "Eigenvalues and eigenvectors computed successfully"
      });
    } catch (error) {
      toast.error("Calculation failed", {
        description: error instanceof Error ? error.message : "Please check your matrix input"
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixBackground />
      
      <main className="relative z-10 container mx-auto px-4 py-16 space-y-12">
        <header className="text-center space-y-4 mb-16">
          <h1 className="text-6xl md:text-7xl font-orbitron font-black glow-text animate-fade-in">
            MATRIX ANALYZER
          </h1>
          <p className="text-xl md:text-2xl font-rajdhani text-muted-foreground max-w-2xl mx-auto">
            Advanced eigenvalue and eigenvector computation with characteristic equation analysis
          </p>
        </header>

        <MatrixInput onCalculate={handleCalculate} />

        {results && (
          <ResultsDisplay
            characteristicEq={results.characteristicEq}
            eigenvalues={results.eigenvalues}
            eigenvectors={results.eigenvectors}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
