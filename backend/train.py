import pandas as pd
import re
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, SnowballStemmer
import contractions
import unicodedata

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('wordnet')
nltk.download('omw-1.4')


class TextPreprocessor(BaseEstimator, TransformerMixin):

    def fit(self, X, y=None):
        return self  # No fitting necessary for preprocessing

    def transform(self, X):
        return X.apply(self.process)

    def process(self, texto):
        # Corrige contracciones y tokeniza el texto
        texto = contractions.fix(texto)
        palabras = word_tokenize(texto)
        
        # Define stopwords y herramientas de stemmer/lemmatizer
        sw = set(stopwords.words('spanish'))
        stemmer = SnowballStemmer('spanish')
        lemmatizer = WordNetLemmatizer()
        
        # Realiza todas las transformaciones en un solo paso
        palabras_procesadas = [
            lemmatizer.lemmatize(stemmer.stem(self.normalizar_palabra(palabra.lower())))
            for palabra in palabras 
            if palabra not in sw
        ]
        
        # Devuelve el texto procesado
        return ' '.join(palabras_procesadas)
    
    def normalizar_palabra(self, palabra):
        # Normaliza los caracteres para eliminar diacríticos (acentos, tildes)
        nfkd_form = unicodedata.normalize('NFKD', palabra)
        palabra_sin_diacriticos = ''.join([c for c in nfkd_form if not unicodedata.combining(c)])
        
        # Elimina cualquier carácter no alfabético (puntuación, números, etc.)
        palabra_limpia = re.sub(r'[^a-zA-Z]', '', palabra_sin_diacriticos)
        
        return palabra_limpia


class TextVectorizer(BaseEstimator, TransformerMixin):

    def __init__(self):
        self.vectorizer = CountVectorizer(ngram_range=(1, 3), min_df = 2) 

    def fit(self, X, y=None):
        return self.vectorizer.fit(X)

    def transform(self, X):
        return pd.DataFrame(self.vectorizer.transform(X).toarray(), columns=self.vectorizer.get_feature_names_out())


class FeatureScaler(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.scaler = StandardScaler(with_mean=False)

    def fit(self, X, y=None):
        return self.scaler.fit(X)

    def transform(self, X):
        return pd.DataFrame(self.scaler.transform(X), columns=X.columns)


def train_model(X, y):

    # Define the pipeline
    pipeline = Pipeline([
        ('text_preprocessing', TextPreprocessor()),
        ('vectorization', TextVectorizer()),
        ('scaling', FeatureScaler()),
        ('classification', GradientBoostingClassifier(n_estimators=300, max_depth=5, random_state=1234)) 
    ])

    # Split the data into training and validation sets
    X_train, X_validation, Y_train, Y_validation = train_test_split(X, y, test_size=0.2, random_state=1234)

    # Train the model
    pipeline.fit(X_train, Y_train)

    # Evaluate the model
    y_pred_validation = pipeline.predict(X_validation)
    metrics = {
        'accuracy': accuracy_score(Y_validation, y_pred_validation),
        'recall': recall_score(Y_validation, y_pred_validation, average='macro'),
        'precision': precision_score(Y_validation, y_pred_validation, average='macro'),
        'f1': f1_score(Y_validation, y_pred_validation, average='macro')
    }

    return pipeline, metrics
