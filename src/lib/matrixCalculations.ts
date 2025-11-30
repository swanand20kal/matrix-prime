import * as math from 'mathjs';

export interface EigenResult {
  characteristicEq: string;
  eigenvalues: Array<{ value: number | { re: number; im: number }, multiplicity: number }>;
  eigenvectors: Array<{ eigenvalue: string, vectors: number[][] }>;
}

export const calculateEigen = (matrix: number[][]): EigenResult => {
  try {
    const M = math.matrix(matrix);
    const n = matrix.length;
    
    // Calculate eigenvalues and eigenvectors
    const result = math.eigs(M);
    const { values, eigenvectors } = result;
    
    console.log('Raw eigs result:', result);
    console.log('Values:', values);
    console.log('Eigenvectors:', eigenvectors);
    
    // Process eigenvalues
    const eigenvaluesArray = Array.isArray(values) ? values : [values];
    const processedEigenvalues = eigenvaluesArray.map((val: any) => {
      console.log('Processing eigenvalue:', val, typeof val);
      if (typeof val === 'object' && 're' in val && 'im' in val) {
        return { value: { re: Number(val.re), im: Number(val.im) }, multiplicity: 1 };
      }
      return { value: Number(val), multiplicity: 1 };
    });
    
    console.log('Processed eigenvalues:', processedEigenvalues);
    
    // Generate characteristic equation string
    const characteristicEq = generateCharacteristicEquation(matrix);
    
    // Process eigenvectors
    const processedEigenvectors: Array<{ eigenvalue: string, vectors: number[][] }> = [];
    
    if (eigenvectors && Array.isArray(eigenvectors)) {
      eigenvectors.forEach((eigenItem: any) => {
        // Each eigenItem has {value, vector}
        const eigenvalueStr = formatEigenvalue(eigenItem.value);
        const vector = eigenItem.vector;
        
        // Convert vector to array
        let vectorArray: any[];
        if (vector._data) {
          vectorArray = vector._data;
        } else if (Array.isArray(vector)) {
          vectorArray = vector;
        } else {
          vectorArray = [vector];
        }
        
        // Convert to real values (take real part if complex)
        const realVector = vectorArray.map((v: any) => {
          if (typeof v === 'object' && 're' in v) {
            return Number(v.re);
          }
          return Number(v);
        });
        
        processedEigenvectors.push({
          eigenvalue: eigenvalueStr,
          vectors: [realVector]
        });
      });
    }
    
    return {
      characteristicEq,
      eigenvalues: processedEigenvalues,
      eigenvectors: processedEigenvectors
    };
  } catch (error) {
    console.error('Error calculating eigenvalues:', error);
    throw new Error('Failed to calculate eigenvalues. Please check your matrix input.');
  }
};

const formatEigenvalue = (val: number | math.Complex | any): string => {
  if (typeof val === 'number') {
    return val.toFixed(4);
  }
  if (typeof val === 'object' && 're' in val && 'im' in val) {
    const complex = val as math.Complex;
    if (Math.abs(complex.im) < 0.0001) return complex.re.toFixed(4);
    const sign = complex.im >= 0 ? '+' : '-';
    return `${complex.re.toFixed(4)} ${sign} ${Math.abs(complex.im).toFixed(4)}i`;
  }
  return String(val);
};

const generateCharacteristicEquation = (matrix: number[][]): string => {
  const n = matrix.length;
  
  try {
    // Create symbolic representation: det(A - λI) = 0
    let equation = `det(A - λI) = 0, where A is the ${n}×${n} matrix`;
    
    return equation;
  } catch (error) {
    return `det(A - λI) = 0 (${n}×${n} matrix)`;
  }
};
