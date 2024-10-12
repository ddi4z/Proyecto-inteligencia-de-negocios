# Machine Learning Frontend

This is the frontend for the machine learning model, implemented using Next js with TypeScript. It uses the RESTful API that serves predictions from a machine learning model, as well as a re-training endpoint to update the model.



## Prerequisites

Make sure you have the following installed on your machine:

- Node.js (version 14.x or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ddi4z/Proyecto-inteligencia-de-negocios.git
   cd Proyecto-inteligencia-de-negocios/frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

To start the application, run the following command:

```bash
npm run dev
```

This will start the Next.js development server, and you can access the application at:

```
http://localhost:3000
```

## Routes

The application includes the following routes:

- **About Us**: `/`  
  Get to know more about our team and the purpose of this application.

- **Train Model**: `/entrenar-modelo`  
  This page allows you to train your machine learning model with your own dataset.

- **Classify File**: `/clasificar-archivo`  
  Use this feature to classify files based on predefined criteria.

- **Classify Opinion**: `/clasificar-opinion`  
  This page provides a way to classify opinions or sentiments.

