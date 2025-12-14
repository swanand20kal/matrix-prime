import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateEigen, EigenResult } from "@/lib/matrixCalculations";
import { toast } from "sonner";
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from "lucide-react";

type QuizStep = "matrix" | "characteristic" | "eigenvalues" | "eigenvectors" | "complete";

interface QuizState {
  matrix: number[][];
  correctResults: EigenResult | null;
}

const QuizFlow = () => {
  const [step, setStep] = useState<QuizStep>("matrix");
  const [order, setOrder] = useState<number>(2);
  const [matrixInput, setMatrixInput] = useState<string[][]>(
    Array(2).fill(null).map(() => Array(2).fill(""))
  );
  const [quizState, setQuizState] = useState<QuizState>({
    matrix: [],
    correctResults: null,
  });

  // Characteristic equation quiz state
  const [charCoefficients, setCharCoefficients] = useState<string[]>([]);
  const [charAnswered, setCharAnswered] = useState(false);
  const [charCorrect, setCharCorrect] = useState(false);
  const [charHint, setCharHint] = useState<string>("");

  // Eigenvalues quiz state
  const [eigenvalueInputs, setEigenvalueInputs] = useState<string[]>([]);
  const [eigenAnswered, setEigenAnswered] = useState(false);
  const [eigenCorrect, setEigenCorrect] = useState(false);
  const [eigenHint, setEigenHint] = useState<string>("");

  // Eigenvectors quiz state
  const [eigenvectorInputs, setEigenvectorInputs] = useState<string[][]>([]);
  const [vectorAnswered, setVectorAnswered] = useState(false);
  const [vectorCorrect, setVectorCorrect] = useState(false);
  const [vectorHint, setVectorHint] = useState<string>("");

  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder);
    setMatrixInput(Array(newOrder).fill(null).map(() => Array(newOrder).fill("")));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newMatrix = [...matrixInput];
    newMatrix[row][col] = value;
    setMatrixInput(newMatrix);
  };

  const handleMatrixSubmit = () => {
    try {
      const numMatrix = matrixInput.map(row => 
        row.map(cell => parseFloat(cell) || 0)
      );
      const results = calculateEigen(numMatrix);
      
      setQuizState({
        matrix: numMatrix,
        correctResults: results,
      });

      // Initialize quiz inputs
      setCharCoefficients(Array(order + 1).fill(""));
      setEigenvalueInputs(Array(results.eigenvalues.length).fill(""));
      setEigenvectorInputs(
        results.eigenvectors.map(ev => Array(order).fill(""))
      );

      setStep("characteristic");
      toast.success("Matrix set! Now answer the quiz questions.");
    } catch (error) {
      toast.error("Invalid matrix", {
        description: "Please check your matrix input"
      });
    }
  };

  const getExpectedCoefficients = (): number[] => {
    const { matrix } = quizState;
    const n = matrix.length;
    
    if (n === 2) {
      // For 2x2: λ² - trace(A)λ + det(A) = 0
      const trace = matrix[0][0] + matrix[1][1];
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      return [1, -trace, det]; // [λ², λ¹, λ⁰]
    } else if (n === 3) {
      // For 3x3: characteristic polynomial coefficients
      const a = matrix;
      const trace = a[0][0] + a[1][1] + a[2][2];
      const sumMinors = 
        (a[0][0] * a[1][1] - a[0][1] * a[1][0]) +
        (a[0][0] * a[2][2] - a[0][2] * a[2][0]) +
        (a[1][1] * a[2][2] - a[1][2] * a[2][1]);
      const det = 
        a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
        a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
        a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
      return [1, -trace, sumMinors, -det];
    }
    // For larger matrices, simplified approach
    return [];
  };

  const checkCharacteristicAnswer = () => {
    const expected = getExpectedCoefficients();
    const userCoeffs = charCoefficients.map(c => parseFloat(c) || 0);
    
    const isCorrect = expected.every((exp, idx) => 
      Math.abs(exp - userCoeffs[idx]) < 0.01
    );

    setCharAnswered(true);
    setCharCorrect(isCorrect);

    if (!isCorrect) {
      const { matrix } = quizState;
      if (matrix.length === 2) {
        const trace = matrix[0][0] + matrix[1][1];
        const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        setCharHint(`Hint: For a 2×2 matrix, the characteristic equation is λ² - (trace)λ + det = 0. 
          Trace = a₁₁ + a₂₂ = ${matrix[0][0]} + ${matrix[1][1]} = ${trace}.
          Det = a₁₁a₂₂ - a₁₂a₂₁ = ${matrix[0][0]}×${matrix[1][1]} - ${matrix[0][1]}×${matrix[1][0]} = ${det}.
          So the equation is: λ² ${trace >= 0 ? '-' : '+'} ${Math.abs(trace)}λ + ${det} = 0`);
      } else {
        setCharHint("Hint: Calculate det(A - λI) = 0. Expand the determinant using cofactors.");
      }
    }
  };

  const checkEigenvalueAnswer = () => {
    const results = quizState.correctResults;
    if (!results) return;

    const userValues = eigenvalueInputs.map(v => parseFloat(v) || 0);
    const correctValues = results.eigenvalues.map(e => {
      if (typeof e.value === 'number') return e.value;
      return e.value.re;
    });

    // Check if all eigenvalues are present (order doesn't matter)
    const sortedUser = [...userValues].sort((a, b) => a - b);
    const sortedCorrect = [...correctValues].sort((a, b) => a - b);
    
    const isCorrect = sortedCorrect.every((correct, idx) => 
      Math.abs(correct - sortedUser[idx]) < 0.01
    );

    setEigenAnswered(true);
    setEigenCorrect(isCorrect);

    if (!isCorrect) {
      const expected = getExpectedCoefficients();
      if (quizState.matrix.length === 2) {
        const a = expected[0];
        const b = expected[1];
        const c = expected[2];
        setEigenHint(`Hint: Solve the characteristic equation λ² ${b >= 0 ? '+' : ''}${b}λ + ${c} = 0.
          Use the quadratic formula: λ = (-b ± √(b² - 4ac)) / 2a
          λ = (${-b} ± √(${b * b} - ${4 * a * c})) / 2
          The eigenvalues are: ${correctValues.map(v => v.toFixed(2)).join(', ')}`);
      } else {
        setEigenHint(`Hint: Solve the characteristic polynomial. The correct eigenvalues are: ${correctValues.map(v => v.toFixed(4)).join(', ')}`);
      }
    }
  };

  const checkEigenvectorAnswer = () => {
    const results = quizState.correctResults;
    if (!results) return;

    // For simplicity, we'll check if vectors are parallel (scalar multiples)
    let allCorrect = true;
    
    results.eigenvectors.forEach((ev, idx) => {
      const userVec = eigenvectorInputs[idx]?.map(v => parseFloat(v) || 0) || [];
      const correctVec = ev.vectors[0];
      
      if (userVec.length !== correctVec.length) {
        allCorrect = false;
        return;
      }

      // Check if parallel (scalar multiple)
      const ratios = userVec.map((u, i) => correctVec[i] !== 0 ? u / correctVec[i] : (u === 0 ? 1 : 0));
      const firstNonZeroRatio = ratios.find(r => r !== 0) || 0;
      const isParallel = ratios.every(r => Math.abs(r - firstNonZeroRatio) < 0.1 || (r === 0 && Math.abs(userVec[ratios.indexOf(r)]) < 0.01));
      
      if (!isParallel) allCorrect = false;
    });

    setVectorAnswered(true);
    setVectorCorrect(allCorrect);

    if (!allCorrect) {
      const hints = results.eigenvectors.map((ev, idx) => {
        const eigenvalue = ev.eigenvalue;
        const vector = ev.vectors[0].map(v => v.toFixed(4)).join(', ');
        return `For λ = ${eigenvalue}: solve (A - λI)v = 0. One eigenvector is [${vector}]`;
      });
      setVectorHint(hints.join('\n'));
    }
  };

  const renderMatrix = () => (
    <Card className="holographic p-8 space-y-6 animate-fade-in">
      <h2 className="text-3xl font-orbitron glow-text">Step 1: Enter Matrix</h2>
      
      <div className="space-y-4">
        <Label className="text-xl font-rajdhani">Matrix Order (n × n)</Label>
        <div className="flex gap-3 flex-wrap">
          {[2, 3, 4].map((n) => (
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
        <Label className="text-xl font-rajdhani">Matrix Elements</Label>
        <div 
          className="grid gap-3 mx-auto w-fit"
          style={{ gridTemplateColumns: `repeat(${order}, minmax(60px, 80px))` }}
        >
          {matrixInput.map((row, i) =>
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
        onClick={handleMatrixSubmit}
        className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all duration-300"
      >
        START QUIZ <ArrowRight className="ml-2" />
      </Button>
    </Card>
  );

  const renderCharacteristicQuiz = () => (
    <Card className="holographic p-8 space-y-6 animate-fade-in">
      <h2 className="text-3xl font-orbitron glow-text">Step 2: Characteristic Equation</h2>
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-lg font-rajdhani mb-4">
          Enter the coefficients of the characteristic equation: det(A - λI) = 0
        </p>
        <p className="text-muted-foreground">
          Format: a₀λⁿ + a₁λⁿ⁻¹ + ... + aₙ = 0
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center">
        {charCoefficients.map((coeff, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              type="number"
              step="any"
              value={coeff}
              onChange={(e) => {
                const newCoeffs = [...charCoefficients];
                newCoeffs[idx] = e.target.value;
                setCharCoefficients(newCoeffs);
              }}
              className="matrix-input w-20 text-center text-lg"
              placeholder="0"
              disabled={charAnswered}
            />
            <span className="text-lg font-rajdhani">
              λ{order - idx > 1 ? <sup>{order - idx}</sup> : order - idx === 1 ? '' : ''}
              {idx < charCoefficients.length - 1 ? ' +' : ' = 0'}
            </span>
          </div>
        ))}
      </div>

      {!charAnswered && (
        <Button
          onClick={checkCharacteristicAnswer}
          className="w-full text-xl font-orbitron font-bold py-6"
        >
          CHECK ANSWER
        </Button>
      )}

      {charAnswered && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          charCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'
        }`}>
          {charCorrect ? (
            <>
              <CheckCircle className="text-green-500 w-8 h-8" />
              <span className="text-xl font-bold text-green-400">Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="text-destructive w-8 h-8" />
              <span className="text-xl font-bold text-destructive">Incorrect</span>
            </>
          )}
        </div>
      )}

      {charHint && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-yellow-500 w-6 h-6 mt-1 flex-shrink-0" />
            <p className="text-lg font-rajdhani whitespace-pre-line">{charHint}</p>
          </div>
        </div>
      )}

      {charAnswered && (
        <Button
          onClick={() => setStep("eigenvalues")}
          className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent"
        >
          NEXT: EIGENVALUES <ArrowRight className="ml-2" />
        </Button>
      )}
    </Card>
  );

  const renderEigenvaluesQuiz = () => (
    <Card className="holographic p-8 space-y-6 animate-fade-in">
      <h2 className="text-3xl font-orbitron glow-text">Step 3: Eigenvalues</h2>
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-lg font-rajdhani">
          Enter all {quizState.correctResults?.eigenvalues.length} eigenvalues:
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {eigenvalueInputs.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xl font-rajdhani">λ<sub>{idx + 1}</sub> =</span>
            <Input
              type="number"
              step="any"
              value={val}
              onChange={(e) => {
                const newInputs = [...eigenvalueInputs];
                newInputs[idx] = e.target.value;
                setEigenvalueInputs(newInputs);
              }}
              className="matrix-input w-24 text-center text-lg"
              placeholder="0"
              disabled={eigenAnswered}
            />
          </div>
        ))}
      </div>

      {!eigenAnswered && (
        <Button
          onClick={checkEigenvalueAnswer}
          className="w-full text-xl font-orbitron font-bold py-6"
        >
          CHECK ANSWER
        </Button>
      )}

      {eigenAnswered && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          eigenCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'
        }`}>
          {eigenCorrect ? (
            <>
              <CheckCircle className="text-green-500 w-8 h-8" />
              <span className="text-xl font-bold text-green-400">Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="text-destructive w-8 h-8" />
              <span className="text-xl font-bold text-destructive">Incorrect</span>
            </>
          )}
        </div>
      )}

      {eigenHint && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-yellow-500 w-6 h-6 mt-1 flex-shrink-0" />
            <p className="text-lg font-rajdhani whitespace-pre-line">{eigenHint}</p>
          </div>
        </div>
      )}

      {eigenAnswered && (
        <Button
          onClick={() => setStep("eigenvectors")}
          className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent"
        >
          NEXT: EIGENVECTORS <ArrowRight className="ml-2" />
        </Button>
      )}
    </Card>
  );

  const renderEigenvectorsQuiz = () => (
    <Card className="holographic p-8 space-y-6 animate-fade-in">
      <h2 className="text-3xl font-orbitron glow-text">Step 4: Eigenvectors</h2>
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-lg font-rajdhani">
          Enter the eigenvector components for each eigenvalue:
        </p>
      </div>

      <div className="space-y-6">
        {quizState.correctResults?.eigenvectors.map((ev, idx) => (
          <div key={idx} className="bg-muted/20 p-4 rounded-lg space-y-3">
            <h3 className="text-xl font-rajdhani text-primary">
              For λ = {ev.eigenvalue}
            </h3>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-lg">v =</span>
              <span className="text-2xl">[</span>
              <div className="flex flex-col gap-2">
                {eigenvectorInputs[idx]?.map((val, vIdx) => (
                  <Input
                    key={vIdx}
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => {
                      const newInputs = [...eigenvectorInputs];
                      newInputs[idx][vIdx] = e.target.value;
                      setEigenvectorInputs(newInputs);
                    }}
                    className="matrix-input w-20 text-center"
                    placeholder="0"
                    disabled={vectorAnswered}
                  />
                ))}
              </div>
              <span className="text-2xl">]</span>
            </div>
          </div>
        ))}
      </div>

      {!vectorAnswered && (
        <Button
          onClick={checkEigenvectorAnswer}
          className="w-full text-xl font-orbitron font-bold py-6"
        >
          CHECK ANSWER
        </Button>
      )}

      {vectorAnswered && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          vectorCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'
        }`}>
          {vectorCorrect ? (
            <>
              <CheckCircle className="text-green-500 w-8 h-8" />
              <span className="text-xl font-bold text-green-400">Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="text-destructive w-8 h-8" />
              <span className="text-xl font-bold text-destructive">Incorrect</span>
            </>
          )}
        </div>
      )}

      {vectorHint && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-yellow-500 w-6 h-6 mt-1 flex-shrink-0" />
            <p className="text-lg font-rajdhani whitespace-pre-line">{vectorHint}</p>
          </div>
        </div>
      )}

      {vectorAnswered && (
        <Button
          onClick={() => setStep("complete")}
          className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent"
        >
          COMPLETE QUIZ <ArrowRight className="ml-2" />
        </Button>
      )}
    </Card>
  );

  const renderComplete = () => {
    const totalCorrect = [charCorrect, eigenCorrect, vectorCorrect].filter(Boolean).length;
    
    return (
      <Card className="holographic p-8 space-y-6 animate-fade-in text-center">
        <h2 className="text-4xl font-orbitron glow-text">Quiz Complete!</h2>
        
        <div className="text-6xl py-8">
          {totalCorrect === 3 ? '🎉' : totalCorrect >= 2 ? '👍' : '📚'}
        </div>
        
        <p className="text-2xl font-rajdhani">
          You got <span className="text-primary font-bold">{totalCorrect}/3</span> correct!
        </p>

        <div className="grid gap-3">
          <div className={`p-3 rounded flex items-center justify-between ${charCorrect ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
            <span>Characteristic Equation</span>
            {charCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />}
          </div>
          <div className={`p-3 rounded flex items-center justify-between ${eigenCorrect ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
            <span>Eigenvalues</span>
            {eigenCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />}
          </div>
          <div className={`p-3 rounded flex items-center justify-between ${vectorCorrect ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
            <span>Eigenvectors</span>
            {vectorCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />}
          </div>
        </div>

        <Button
          onClick={() => {
            setStep("matrix");
            setCharAnswered(false);
            setCharCorrect(false);
            setCharHint("");
            setEigenAnswered(false);
            setEigenCorrect(false);
            setEigenHint("");
            setVectorAnswered(false);
            setVectorCorrect(false);
            setVectorHint("");
            setMatrixInput(Array(order).fill(null).map(() => Array(order).fill("")));
          }}
          className="w-full text-xl font-orbitron font-bold py-6 bg-gradient-to-r from-primary to-accent"
        >
          TRY ANOTHER MATRIX
        </Button>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {["matrix", "characteristic", "eigenvalues", "eigenvectors", "complete"].map((s, idx) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all ${
              step === s 
                ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]' 
                : idx < ["matrix", "characteristic", "eigenvalues", "eigenvectors", "complete"].indexOf(step)
                  ? 'bg-primary/50'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {step === "matrix" && renderMatrix()}
      {step === "characteristic" && renderCharacteristicQuiz()}
      {step === "eigenvalues" && renderEigenvaluesQuiz()}
      {step === "eigenvectors" && renderEigenvectorsQuiz()}
      {step === "complete" && renderComplete()}
    </div>
  );
};

export default QuizFlow;
