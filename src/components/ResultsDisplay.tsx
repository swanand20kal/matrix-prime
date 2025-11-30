import { Card } from "@/components/ui/card";

interface ResultsDisplayProps {
  characteristicEq: string;
  eigenvalues: Array<{ value: number | { re: number; im: number }, multiplicity: number }>;
  eigenvectors: Array<{ eigenvalue: string, vectors: number[][] }>;
}

const ResultsDisplay = ({ characteristicEq, eigenvalues, eigenvectors }: ResultsDisplayProps) => {
  const formatComplex = (val: number | { re: number; im: number }): string => {
    if (typeof val === 'number') {
      return val.toFixed(4);
    }
    const { re, im } = val;
    if (Math.abs(im) < 0.0001) return re.toFixed(4);
    const sign = im >= 0 ? '+' : '-';
    return `${re.toFixed(4)} ${sign} ${Math.abs(im).toFixed(4)}i`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Characteristic Equation */}
      <Card className="holographic p-8 border-2 border-primary/30 hover:border-primary/50 transition-all">
        <h2 className="text-3xl font-orbitron glow-text mb-6">
          Characteristic Equation
        </h2>
        <div className="bg-muted/30 p-6 rounded-lg">
          <p className="text-xl font-rajdhani text-center break-all">
            {characteristicEq}
          </p>
        </div>
      </Card>

      {/* Eigenvalues */}
      <Card className="holographic p-8 border-2 border-primary/30 hover:border-primary/50 transition-all">
        <h2 className="text-3xl font-orbitron glow-text mb-6">
          Eigenvalues
        </h2>
        <div className="space-y-4">
          {eigenvalues.map((eigen, idx) => (
            <div 
              key={idx} 
              className="bg-muted/30 p-6 rounded-lg flex items-center justify-between"
            >
              <span className="text-xl font-rajdhani">
                λ<sub>{idx + 1}</sub> =
              </span>
              <span className="text-2xl font-semibold text-primary">
                {formatComplex(eigen.value)}
              </span>
              {eigen.multiplicity > 1 && (
                <span className="text-sm text-muted-foreground">
                  (multiplicity: {eigen.multiplicity})
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Eigenvectors */}
      <Card className="holographic p-8 border-2 border-primary/30 hover:border-primary/50 transition-all">
        <h2 className="text-3xl font-orbitron glow-text mb-6">
          Eigenvectors
        </h2>
        <div className="space-y-6">
          {eigenvectors.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xl font-rajdhani text-primary">
                For λ = {item.eigenvalue}
              </h3>
              <div className="grid gap-4">
                {item.vectors.map((vector, vIdx) => (
                  <div key={vIdx} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">v<sub>{vIdx + 1}</sub> =</span>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl">[</span>
                        <div className="flex flex-col gap-1">
                          {vector.map((val, i) => (
                            <span key={i} className="text-lg font-semibold text-primary">
                              {val.toFixed(4)}
                            </span>
                          ))}
                        </div>
                        <span className="text-2xl">]</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
