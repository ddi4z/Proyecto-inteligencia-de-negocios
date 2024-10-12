import pandas as pd
import re
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, FunctionTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
from imblearn.over_sampling import SMOTE
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, SnowballStemmer
import contractions
import unicodedata

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')


def normalizar_palabra(palabra):
    # Normaliza los caracteres para eliminar diacríticos (acentos, tildes)
    nfkd_form = unicodedata.normalize('NFKD', palabra)
    palabra_sin_diacriticos = ''.join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # Elimina cualquier carácter no alfabético (puntuación, números, etc.)
    palabra_limpia = re.sub(r'[^a-zA-Z]', '', palabra_sin_diacriticos)
    
    return palabra_limpia

def procesar(texto):
    # Corrige contracciones
    texto = contractions.fix(texto)
    
    # Tokeniza el texto
    palabras = word_tokenize(texto)
    
    # Define stopwords y herramientas de stemmer/lemmatizer
    sw = set(stopwords.words('spanish'))
    stemmer = SnowballStemmer('spanish')
    lemmatizer = WordNetLemmatizer()
    
    # Realiza todas las transformaciones en un solo paso
    palabras_procesadas = [
        lemmatizer.lemmatize(stemmer.stem(normalizar_palabra(palabra.lower())))
        for palabra in palabras 
        if palabra not in sw
    ]
    
    # Devuelve el texto procesado
    return ' '.join(palabras_procesadas)


def train_model(X, y):

    # Apply the text preprocessing function to the input text
    df = pd.DataFrame({ 'Textos_espanol': X, 'sdg': y })
    df["Textos_espanol"] = df['Textos_espanol'].apply(procesar)

    # Apply the CountVectorizer to the preprocessed text
    bv = CountVectorizer(ngram_range=(1, 3), min_df = 2) 
    bv_matrix = bv.fit_transform(df["Textos_espanol"]).toarray()
    vocab = bv.get_feature_names_out()
    bv_df = pd.DataFrame(bv_matrix, columns=vocab)
    df = pd.concat([df.drop(columns=["Textos_espanol"]), bv_df], axis=1)

    # Split the data into training and validation sets
    target_column = 'sdg'
    Y = df[target_column]
    X = df.drop(columns=[target_column])
    X_train, X_validation, Y_train, Y_validation = train_test_split(X, Y, test_size=0.2, random_state=1234)

    # Apply SMOTE to the training set
    smt = SMOTE()
    X_train, Y_train = smt.fit_resample(X_train, Y_train)

    # Scale the features
    scaler = StandardScaler()
    X_train = pd.DataFrame(scaler.fit_transform(X_train), columns=vocab)
    X_validation = pd.DataFrame(scaler.transform(X_validation), columns=vocab)

    # Train the model
    gb_clf = GradientBoostingClassifier(n_estimators=300, max_depth=5, random_state=1234)
    gb_clf = gb_clf.fit(X_train, Y_train)
    
    # Evaluate the model
    y_pred_validation = gb_clf.predict(X_validation)
    metrics = {
        'accuracy': accuracy_score(Y_validation, y_pred_validation),
        'recall': recall_score(Y_validation, y_pred_validation, average='macro'),
        'precision': precision_score(Y_validation, y_pred_validation, average='macro'),
        'f1': f1_score(Y_validation, y_pred_validation, average='macro')
    }

    # Create a new pipeline with the trained model
    pipeline = Pipeline([
        ('text_preprocessing', FunctionTransformer(lambda x: x.apply(procesar))),
        ('vectorization', FunctionTransformer(lambda x: pd.DataFrame(bv.transform(x).toarray(), columns=vocab))),
        ('scaling', FunctionTransformer(lambda x: pd.DataFrame(scaler.transform(x), columns=vocab))),
        ('classification', gb_clf) 
    ])
    
    return pipeline, metrics
