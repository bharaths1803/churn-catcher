from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from collections import Counter
import pandas as pd
import numpy as np
from joblib import load
import os

app = Flask(__name__, static_folder="frontend", static_url_path="/")

CORS(app)

# Load models and other artifacts
rf_model = load("ml/models/random_forest_model.pkl")
gb_model = load("ml/models/gradient_boosting_model.pkl")
xgb_model = load("ml/models/xgboost_model.pkl")
ensemble_data = load("ml/models/ensemble_model.pkl")
selected_features = ensemble_data["selected_features"]
scaler = load("ml/models/scaler.pkl")
label_encoder = load("ml/models/label_encoder.pkl")
weights = ensemble_data["weights"]

def preprocess_data(data):
    # Apply label encoding
    data['state'] = label_encoder.fit_transform(data['state'])
    data['international plan'] = data['international plan'].apply(lambda x: 1 if x == 'yes' else 0)
    data['voice mail plan'] = data['voice mail plan'].apply(lambda x: 1 if x == 'yes' else 0)
    
    # Drop unnecessary columns
    data.drop(['area code', 'phone number'], axis=1, inplace=True)
    
    # Select only the features used during training
    data = data[selected_features]
    
    # Apply scaling
    data_scaled = scaler.transform(data)
    
    return data_scaled

def enhanced_weighted_voting(probabilities, weights):
    weighted_probs = np.zeros_like(list(probabilities.values())[0])
    for (name, prob), weight in zip(probabilities.items(), weights):
        weighted_probs += prob * weight
    return (weighted_probs[:, 1] >= 0.5).astype(int)

def calculate_churn_percentage(ensemble_predictions):
    total_customers = len(ensemble_predictions)
    churned_customers = sum(ensemble_predictions)
    print(f"Total customers churned {churned_customers}")
    
    churn_percentage = (churned_customers / total_customers) * 100
    return round(churn_percentage, 2)

def get_feature_importance():
    importance_values = rf_model.feature_importances_
    feature_importance = sorted(zip(selected_features, importance_values), key=lambda x: x[1], reverse=True)
    response = [{"feature": f, "importance": round(imp * 100, 2)} for f, imp in feature_importance]
    return response

def get_customer_segmentation_count(data_processed):
    probabilities = xgb_model.predict_proba(data_processed)[:, 1]  # Get probability of churn (1)
    # Define risk segments
    def get_risk_category(prob):
        if prob >= 0.66:
            return "High Risk"
        elif prob >= 0.33:
            return "Medium Risk"
        else:
            return "Low Risk"
        
    categories = {"High Risk": 0, "Medium Risk": 0, "Low Risk": 0}
    values = [get_risk_category(p) for p in probabilities]

    # Count occurrences
    count_dict = Counter(values)
    total_count = len(values)


    # Convert to percentage and update categories
    for key in categories:
        categories[key] = round((count_dict[key] / total_count) * 100, 2) if key in count_dict else 0
    return categories

def get_statewise_churn(temp_data, ensemble_predictions):
    state_churn_df = pd.DataFrame({
        'state': temp_data['state'],
        'churn': ensemble_predictions.tolist()  # 1 = Churned, 0 = Not Churned
    })

    state_churn = state_churn_df.groupby('state')['churn'].mean().mul(100).round(2)

    # Convert to dictionary
    state_churn_dict = state_churn.to_dict()

    return state_churn_dict

def calculate_potential_revenue_loss(temp_data):
    charge_columns = ["total day charge", "total eve charge", "total night charge", "total intl charge"]

    churned_customers = temp_data[temp_data["churn"] == 1]

    # Calculate total charges for each churned customer
    churned_customers["total charges"] = churned_customers[charge_columns].sum(axis=1)

    # Sum up total revenue loss
    total_revenue_loss = round(churned_customers["total charges"].sum(), 2)

    return total_revenue_loss

def churn_percentage_by_international_plan(df):
    churn_rates = df.groupby("international plan")["churn"].mean() * 100
    return {
        "Yes": round(churn_rates.get(1, 0), 2),  # If 'yes' is missing, return 0%
        "No": round(churn_rates.get(0, 0), 2)    # If 'no' is missing, return 0%
    }

def churn_percentage_by_voice_mail_plan(df):
    churn_rates = df.groupby("voice mail plan")["churn"].mean() * 100
    return {
        "Yes": round(churn_rates.get(1, 0), 2),  # If 'yes' is missing, return 0%
        "No": round(churn_rates.get(0, 0), 2)    # If 'no' is missing, return 0%
    }

def churn_percentage_by_time_spent(df):
    # Calculate total time spent
    df["total_time_spent"] = df["total day minutes"] + df["total eve minutes"] + df["total night minutes"]
    
    # Define segmentation function
    def usage_category(time):
        if time < 475:
            return "Low Usage"
        elif 475 <= time <= 675:
            return "Medium Usage"
        else:
            return "High Usage"

    df["usage_category"] = df["total_time_spent"].apply(usage_category)

    usage_categories = ["Low Usage", "Medium Usage", "High Usage"]
    churn_percentages = {}

    for category in usage_categories:
        total_count = len(df[df["usage_category"] == category])
        churn_count = df[(df["usage_category"] == category) & (df["churn"] == 1)].shape[0]
        
        churn_percentages[category] = round((churn_count / total_count * 100), 2) if total_count > 0 else 0

    return churn_percentages
    
def churn_percentage_by_calls_count(df):
    df["total_calls"] = df["total day calls"] + df["total eve calls"] + df["total night calls"] + df["total intl calls"]
    
    # Define segmentation function
    def call_category(calls):
        if calls < 266:
            return "Low Callers"
        elif 266 <= calls <= 341:
            return "Medium Callers"
        else:
            return "High Callers"

    df["call_category"] = df["total_calls"].apply(call_category)

    call_categories = ["Low Callers", "Medium Callers", "High Callers"]
    churn_percentages = {}

    for category in call_categories:
        total_count = len(df[df["call_category"] == category])
        churn_count = df[(df["call_category"] == category) & (df["churn"] == 1)].shape[0]
        
        churn_percentages[category] = round((churn_count / total_count * 100),2) if total_count > 0 else 0

    return churn_percentages


def find_churn_risk(churn_percentage):
    if churn_percentage <= 33:
        return "Low"
    elif churn_percentage > 33 and churn_percentage <= 66:
        return "Medium"
    else:
        return "High"


@app.route('/predict', methods=['POST'])
def predict():
    file = request.files.get('file')
    print("Hit this endpoint")
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the CSV
    try:
        data = pd.read_csv(file)
        temp_data = data.copy()
    except Exception as e:
        return jsonify({'error': 'Invalid file format'}), 400
    
    # Preprocess the data
    try:
        data_processed = preprocess_data(data)
    except Exception as e:
        return jsonify({'error': f'Preprocessing failed: {str(e)}'}), 400
    
    # Get predictions and probabilities for each model
    probabilities = {
        'Random Forest': rf_model.predict_proba(data_processed),
        'Gradient Boosting': gb_model.predict_proba(data_processed),
        'XGBoost': xgb_model.predict_proba(data_processed)
    }
    
    # Make ensemble predictions
    ensemble_predictions = enhanced_weighted_voting(probabilities, weights)
    temp_data['churn'] = ensemble_predictions

    #Calculate churn percentage
    churn_percentage = calculate_churn_percentage(ensemble_predictions)

    #Features contributing to churn
    feature_importance = get_feature_importance()

    #Customer segmentation count
    category_counts = get_customer_segmentation_count(data_processed)


    state_wise_churn_counts = get_statewise_churn(temp_data, ensemble_predictions)

    potential_revenue_loss = calculate_potential_revenue_loss(temp_data)

    churn_by_international_plan = churn_percentage_by_international_plan(temp_data)

    churn_by_voicemail = churn_percentage_by_voice_mail_plan(temp_data)

    churn_by_time_spent = churn_percentage_by_time_spent(temp_data) 

    churn_by_calls_count = churn_percentage_by_calls_count(temp_data)

    churn_risk = find_churn_risk(churn_percentage)

    # Return predictions as JSON
    response = {
        'predictions': ensemble_predictions.tolist(),
        'churn_percentage': churn_percentage,
        'feature_importance': feature_importance,
        'customer_segmentation': category_counts,
        'state_wise_churn_counts': state_wise_churn_counts,
        'potential_revenue_loss': potential_revenue_loss,
        'churn_by_international_plan': churn_by_international_plan,
        'churn_by_voicemail': churn_by_voicemail,
        'churn_by_time_spent': churn_by_time_spent,
        'churn_by_calls_count': churn_by_calls_count,
        'churn_risk': churn_risk,
    }
    return jsonify(response)

@app.route("/")
def serve_react():
    return send_from_directory("frontend", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("frontend", path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
