export interface resultadoConsulta {
  predicciones: number[];
  probabilidades: number[][];
}

export interface promedioPorOds {
  promedio3: number;
  promedio4: number;
  promedio5: number;
}

export interface resultadoEntrenamiento {
  accuracy: number;
  recall: number;
  precision: number;
  f1: number;
  words: [string, number][][];
}

export interface conteoPorOds {
  conteo3: number;
  conteo4: number;
  conteo5: number;
}