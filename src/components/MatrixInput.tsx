import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MatrixInputProps {
  onCalculate: (matrix: number[][]) => void;
}

const MatrixInput = ({ onCalculate }: MatrixInputProps) => {
  const [order, setOrder] = useState<number>(2);
  const [matrix, setMatrix] = useState<string[][]>(
    Array(2).fill(null).map(() => Array(2).fill(""))
  );

  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder);
    setMatrix(Array(newOrder).fill(null).map(() => Array(newOrder).fill("")));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = value;
    setMatrix(newMatrix);
  };

  const handleCalculate = () => {
    const numMatrix = matrix.map(row => 
      row.map(cell => parseFloat(cell) || 0)
    );
    onCalculate(numMatrix);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="holographic p-8 rounded-lg space-y-6 animate-fade-in">
        <div className="space-y-4">
          <Label className="text-2xl font-orbitron glow-text">
            Matrix Order (n × n)
          </Label>
          <div className="flex gap-3 flex-wrap">
            {[2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                onClick={() => handleOrderChange(n)}
                variant={order === n ? "default" : "outline"}
                className={`text-lg font-semibold transition-all ${
                  order === n 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]" 
                    : "hover:border-primary hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                }`}
              >
                {n} × {n}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-2xl font-orbitron glow-text">
            Matrix Elements
          </Label>
          <div 
            className="grid gap-3 mx-auto w-fit"
            style={{
              gridTemplateColumns: `repeat(${order}, minmax(60px, 80px))`,
            }}
          >
            {matrix.map((row, i) =>
              row.map((cell, j) => (
                <Input
                  key={`${i}-${j}`}
                  type="number"
                  step="any"
                  value={cell}
                  onChange={(e) => handleCellChange(i, j, e.target.value)}
                  className="matrix-input text-center text-lg font-rajdhani font-semibold"
                  placeholder="0"
                />
              ))
            )}
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all duration-300"
        >
          CALCULATE EIGENVALUES
        </Button>
      </div>
    </div>
  );
};

export default MatrixInput;
