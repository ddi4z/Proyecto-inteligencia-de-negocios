from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from joblib import load, dump
import uvicorn
from train import train_model

# Cargar el pipeline previamente entrenado
pipeline = load('pipeline.joblib')

# Inicializar la aplicación FastAPI
app = FastAPI()


# Modelo para la solicitud de predicción
class PredictionRequest(BaseModel):
    Textos_espanol: list


# Modelo para la solicitud de reentrenamiento
class RetrainingRequest(BaseModel):
    Textos_espanol: list
    sdg: list


# Endpoint 1: Predicción
@app.post("/predict")
async def predict(request: PredictionRequest):

    # Extraer los datos de la solicitud
    textos = pd.Series(request.Textos_espanol).astype(str)

    # Usar el pipeline para hacer predicciones
    predicciones = pipeline.predict(textos)
    probabilidades = pipeline.predict_proba(textos)
    
    # Devolver las predicciones y probabilidades
    return {"predicciones": predicciones.tolist(), "probabilidades": probabilidades.tolist()}


# Endpoint 2: Reentrenamiento del modelo
@app.post("/retrain")
async def retrain(request: RetrainingRequest):

    # Extraer los datos de la solicitud
    textos = pd.Series(request.Textos_espanol).astype(str)
    etiquetas = pd.Series(request.sdg).astype(int)
    
    # Entrenar un nuevo modelo con los datos proporcionados
    pipeline, metrics = train_model(textos, etiquetas)
    
    # Guardar el modelo actualizado
    dump(pipeline, 'pipeline.joblib')
    
    return metrics


# Para correr la aplicación
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
