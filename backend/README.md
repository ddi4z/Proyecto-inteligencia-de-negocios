# Machine Learning Backend

This is the backend for the machine learning model, implemented using FastAPI. It provides a RESTful API that serves predictions from a machine learning model, as well as a re-training endpoint to update the model.

## Installation

Follow these steps to install and set up the project:

1. Clone the repository:
   ```bash
   git clone https://github.com/ddi4z/Proyecto-inteligencia-de-negocios.git
   cd Proyecto-inteligencia-de-negocios
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the dependencies listed in `requirements.txt`:
   ```bash
   pip install -r backend/requirements.txt
   ```

## Usage

To start the FastAPI backend, run the following command:

```bash
uvicorn backend.main:app --reload
```

The backend will be available at `http://localhost:8000`.

## SDG Classification Model

The backend uses a pre-trained machine learning model to classify Spanish texts into Sustainable Development Goals (SDGs). The model is trained on a dataset of Spanish texts labeled with SDG categories. The model is loaded when the backend starts and is used to make predictions on new texts. The meaning of each SDG category in the dataset is as follows:

- `3`: Good Health and Well-being
- `4`: Quality Education
- `5`: Gender Equality

## Endpoints

The backend exposes two endpoints: one for making predictions and another for retraining the model with new data. Below is a detailed explanation of how each endpoint works, including examples of request and response formats.

### 1. POST `/predict`

This endpoint accepts a list of Spanish texts and returns a prediction along with the associated probabilities for each text. The texts are processed through a pre-trained pipeline that includes text preprocessing, vectorization, and classification.

#### Request

- **Method**: `POST`
- **Endpoint**: `/predict`
- **Request Body**: JSON object containing a list of texts in Spanish (`Textos_espanol`) that are used as input for predictions.

Example request body:

```json
{
  "Textos_espanol": [
    "Este es el primer texto para predecir.",
    "Aquí otro ejemplo de entrada de texto."
  ]
}
```

#### Response

- **Status Code**: `200 OK`
- **Response Body**: JSON object containing two lists:
  - `predicciones`: A list of predicted classes for each input text.
  - `probabilidades`: A list of probabilities associated with each prediction.

Example response:

```json
{
  "predicciones": [3, 4],
  "probabilidades": [
    [0.85, 0.15, 0.0],
    [0.4, 0.6, 0.0]
  ]
}
```

In this example:

- `"predicciones"` contains the predicted class labels (e.g., `3`, `4` or `5`).
- `"probabilidades"` contains the probabilities for each class.

#### Example

Execute the following command to make a prediction using the `/predict` endpoint:

```bash
curl -X 'POST' \
  'http://localhost:8000/predict' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "Textos_espanol": [
    "Estas disposiciones toman básicamente dos formas: beneficios especiales para divorciados o regulaciones para compartir la pensión (o 'partir la pensión') después del divorcio."
    "En Corea, se reduce el costo compartido de la atención, incluidos los productos farmacéuticos, para los pacientes con cáncer. En Bélgica, Finlandia, Islandia y Noruega, existen exenciones de pago para ciertos productos farmacéuticos para pacientes."
  ]
}'
```

### 2. POST `/retrain`

This endpoint accepts new training data, including both text inputs and their corresponding class labels, to retrain the machine learning model. It returns performance metrics after retraining, including precision, recall, and F1-score.

#### Request

- **Method**: `POST`
- **Endpoint**: `/retrain`
- **Request Body**: JSON object containing two lists:
  - `Textos_espanol`: A list of Spanish texts for retraining.
  - `sdg`: A list of labels (target values) corresponding to the input texts.

Example request body:

```json
{
  "Textos_espanol": [
    "Este es un nuevo texto de entrenamiento.",
    "Segundo texto para reentrenar el modelo."
  ],
  "sdg": [0, 1]
}
```

#### Response

- **Status Code**: `200 OK`
- **Response Body**: JSON object containing performance metrics after retraining:
  - `accuracy`: Accuracy score for the updated model.
  - `precision`: Precision score for the updated model.
  - `recall`: Recall score for the updated model.
  - `f1_score`: F1-score for the updated model.

Example response:

```json
{
  "accuracy": 0.91,
  "precision": 0.92,
  "recall": 0.89,
  "f1_score": 0.9
}
```

In this example, the response indicates the performance of the model on the retraining data.

#### Example

Execute the following command to retrain the model using the `/retrain` endpoint:

```bash
curl -X 'POST' \
  'http://localhost:8000/predict' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "Textos_espanol": [
    "Estas disposiciones toman básicamente dos formas: beneficios especiales para divorciados o regulaciones para compartir la pensión (o 'partir la pensión') después del divorcio."
    "En Corea, se reduce el costo compartido de la atención, incluidos los productos farmacéuticos, para los pacientes con cáncer. En Bélgica, Finlandia, Islandia y Noruega, existen exenciones de pago para ciertos productos farmacéuticos para pacientes."
  ],
  "sdg": [5, 3]
}'
```
