import MatrixBackground from "@/components/MatrixBackground";
import QuizFlow from "@/components/QuizFlow";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixBackground />
      
      <main className="relative z-10 container mx-auto px-4 py-16 space-y-12">
        <header className="text-center space-y-4 mb-16">
          <h1 className="text-6xl md:text-7xl font-orbitron font-black glow-text animate-fade-in">
            EIGENVALUE QUIZ
          </h1>
          <p className="text-xl md:text-2xl font-rajdhani text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge of eigenvalues, eigenvectors, and characteristic equations
          </p>
        </header>

        <QuizFlow />
      </main>
    </div>
  );
};

export default Index;
