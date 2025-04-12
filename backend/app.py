from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from collections import Counter
import pandas as pd
import numpy as np
from joblib import load
import os
from fpdf import FPDF
from dotenv import load_dotenv
from google import genai
import base64


load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
)

app = Flask(__name__)

CORS(app)

if os.getenv("DOWNLOAD_MODELS") == "True":
    from download_models import download_models
    download_models()

# Load models and other artifacts
rf_model = load("ml/new_models/random_forest_model.pkl")
gb_model = load("ml/new_models/gradient_boosting_model.pkl")
xgb_model = load("ml/new_models/xgboost_model.pkl")
ensemble_data = load("ml/new_models/ensemble_model.pkl")
selected_features_data = load("ml/new_models/selected_features_model.pkl")
selected_features = selected_features_data["selected_features"]
scaler = load("ml/new_models/scaler.pkl")
label_encoder = load("ml/new_models/label_encoder.pkl")

risk_data = 0
users = 0

def preprocess_data(data):
    # Apply label encoding
    data['state'] = label_encoder.fit_transform(data['state'])
    data['international plan'] = data['international plan'].apply(lambda x: 1 if x == 'yes' else 0)
    data['voice mail plan'] = data['voice mail plan'].apply(lambda x: 1 if x == 'yes' else 0)
    
    # Drop unnecessary columns
    data.drop(['area code', 'phone number', 'user id'], axis=1, inplace=True)
    
    # Select only the features used during training
    data = data[selected_features]
    
    # Apply scaling
    data_scaled = scaler.transform(data)
    
    return data_scaled


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
    global risk_data
    probabilities = ensemble_data.predict_proba(data_processed)[:, 1]  # Get probability of churn (1)
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

    risk_data = values


    # Count occurrences
    count_dict = Counter(values)
    total_count = len(values)
    print("Length of the array is", total_count)


    # Convert to percentage and update categories
    for key in categories:
        categories[key] = round((count_dict[key] / total_count) * 100, 2) if key in count_dict else 0
    return categories

def get_statewise_churn(temp_data, ensemble_predictions, category):
    if category != "0":
        state_churn_df = pd.DataFrame({
            'state': temp_data['state'],
            'category': temp_data['category'],
            'churn': ensemble_predictions.tolist()  # 1 = Churned, 0 = Not Churned
        })
        state_churn_df = state_churn_df[state_churn_df['category'] == category]
    else:
        state_churn_df = pd.DataFrame({
            'state': temp_data['state'],
            'churn': ensemble_predictions.tolist()  # 1 = Churned, 0 = Not Churned
        })


    state_churn = state_churn_df.groupby('state')['churn'].mean().mul(100).round(2)

    # Convert to dictionary
    state_churn_dict = state_churn.to_dict()

    return state_churn_dict

def calculate_potential_revenue_loss(temp_data, category):
    charge_columns = ["total day charge", "total eve charge", "total night charge", "total intl charge"]

    churned_customers = temp_data[temp_data["churn"] == 1].copy()
    if category != "0":
        churned_customers = churned_customers[churned_customers["category"] == category]

    # Calculate total charges for each churned customer
    churned_customers["total charges"] = churned_customers[charge_columns].sum(axis=1)

    # Sum up total revenue loss
    total_revenue_loss = round(churned_customers["total charges"].sum(), 2)

    return total_revenue_loss

def churn_percentage_by_international_plan(df, category):
    if category != "0":
        df2 = df[df["category"] == category].copy()
    else:
        df2 = df.copy()
    churn_rates = df2.groupby("international plan")["churn"].mean() * 100
    
    ans = {
        "Yes": round(churn_rates.get(1, 0), 2),  # If 'yes' is missing, return 0%
        "No": round(churn_rates.get(0, 0), 2)    # If 'no' is missing, return 0%
    }
    return ans

def churn_percentage_by_voice_mail_plan(df, category):
    if category != "0":
        df2 = df[df["category"] == category].copy()
    else:
        df2 = df.copy()
    churn_rates = df2.groupby("voice mail plan")["churn"].mean() * 100
    ans = {
        "Yes": round(churn_rates.get(1, 0), 2),  # If 'yes' is missing, return 0%
        "No": round(churn_rates.get(0, 0), 2)    # If 'no' is missing, return 0%
    }
    return ans 

def churn_percentage_by_time_spent(df, risk):
    # Calculate total time spent
    if risk != "0":
        df2 = df[df["category"] == risk].copy()
    else:
        df2 = df.copy()
    df2["total_time_spent"] = df2["total day minutes"] + df2["total eve minutes"] + df2["total night minutes"]
    
    # Define segmentation function
    def usage_category(time):
        if time < 475:
            return "Low Usage"
        elif 475 <= time <= 675:
            return "Medium Usage"
        else:
            return "High Usage"

    df2["usage_category"] = df2["total_time_spent"].apply(usage_category)

    usage_categories = ["Low Usage", "Medium Usage", "High Usage"]
    churn_percentages = {}

    for category in usage_categories:
        total_count = len(df2[df2["usage_category"] == category])
        churn_count = df2[(df2["usage_category"] == category) & (df2["churn"] == 1)].shape[0]
        
        churn_percentages[category] = round((churn_count / total_count * 100), 2) if total_count > 0 else 0
    return churn_percentages
    
def churn_percentage_by_calls_count(df, risk):
    if risk != "0":
        df2 = df[df["category"] == risk].copy()
    else:
        df2 = df.copy()
    df2["total_calls"] = df2["total day calls"] + df2["total eve calls"] + df2["total night calls"] + df2["total intl calls"]
    
    # Define segmentation function
    def call_category(calls):
        if calls < 266:
            return "Low Callers"
        elif 266 <= calls <= 341:
            return "Medium Callers"
        else:
            return "High Callers"

    df2["call_category"] = df2["total_calls"].apply(call_category)

    call_categories = ["Low Callers", "Medium Callers", "High Callers"]
    churn_percentages = {}

    for category in call_categories:
        total_count = len(df2[df2["call_category"] == category])
        churn_count = df2[(df2["call_category"] == category) & (df2["churn"] == 1)].shape[0]
        
        churn_percentages[category] = round((churn_count / total_count * 100),2) if total_count > 0 else 0
    
    return churn_percentages

def find_churn_risk(churn_percentage):
    if churn_percentage <= 33:
        return "Low"
    elif churn_percentage > 33 and churn_percentage <= 66:
        return "Medium"
    else:
        return "High"

def assign_risk(data_processed, temp_data):
    probabilities = ensemble_data.predict_proba(data_processed)[:, 1]  # Get probability of churn (1)

    # Define risk segments
    def get_risk_category(prob):
        if prob >= 0.66:
            return "High Risk"
        elif prob >= 0.33:
            return "Medium Risk"
        else:
            return "Low Risk"

    values = [get_risk_category(p) for p in probabilities]

    # Ensure data_processed is a DataFrame before adding the column
    if isinstance(temp_data, pd.DataFrame):
        temp_data["category"] = values  # Assign category column
    else:
        temp_data = pd.DataFrame(temp_data)  # Convert to DataFrame if it's a NumPy array
        temp_data["category"] = values  # Add the new column

    return temp_data  # Return the updated DataFrame




def generate_retention_strategies(response_data):
    
    prompt = f"""
    You are an AI specializing in telecom customer churn analysis.
    Based on the provided churn insights, generate a **highly specific and data-driven** retention strategy.

    **Churn Insights:**
    - Churn Percentage: {response_data['churn_percentage']}%
    - Key Features Contributing to Churn:
    {response_data['feature_importance']}
    - Customer Segmentation (High, Medium, Low Risk): {response_data['customer_segmentation']}
    - State-wise Churn Trends:
    {response_data['state_wise_churn_counts']}
    - Potential Revenue Loss from Churn: ${response_data['potential_revenue_loss']}
    - Churn Analysis by International Plan: {response_data['churn_by_international_plan']}
    - Churn Analysis by Voicemail Plan: {response_data['churn_by_voicemail']}
    - Churn Analysis by Time Spent: {response_data['churn_by_time_spent']}
    - Churn Analysis by Call Counts: {response_data['churn_by_calls_count']}
    - Overall Churn Risk Level: {response_data['churn_risk']}

    **TASK:**
    - Analyze the above data and generate retention strategies tailored to the dataset.
    - Include recommendations on **pricing, customer service, loyalty programs, and engagement tactics**.
    - Explain why each strategy applies based on the given data.
    - Give exactly 1 strategy for each data sent
    - Title: General Suggestions

    Provide the response in a structured, point-by-point format without subheadings.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    return response.text

def generate_retention_strategies_low(response_data):
    
    prompt = f"""
    You are an AI specializing in telecom customer churn analysis.
    Based on the provided churn insights, generate a **highly specific and data-driven** retention strategy.

    **Churn Insights:**
    - State-wise Churn Trends:
    {response_data['state_wise_churn_counts']}
    - Potential Revenue Loss from Churn: ${response_data['potential_revenue_loss']}
    - Churn Analysis by International Plan: {response_data['churn_by_international_plan']}
    - Churn Analysis by Voicemail Plan: {response_data['churn_by_voicemail']}
    - Churn Analysis by Time Spent: {response_data['churn_by_time_spent']}
    - Churn Analysis by Call Counts: {response_data['churn_by_calls_count']}

    **TASK:**
    - The above data is for low risk churn customers
    - Analyze the above data and generate retention strategies tailored to the dataset.
    - Include recommendations on **pricing, customer service, loyalty programs, and engagement tactics**.
    - Explain why each strategy applies based on the given data.
    - Give exactly 1 strategy for each data sent
    - Title: Retention Strategies of Low risk churners

    Provide the response in a structured, point-by-point format without subheadings.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    return response.text

def generate_retention_strategies_medium(response_data):

    prompt = f"""
    You are an AI specializing in telecom customer churn analysis.
    Based on the provided churn insights, generate a **highly specific and data-driven** retention strategy.

    **Churn Insights:**
    - State-wise Churn Trends:
    {response_data['state_wise_churn_counts']}
    - Potential Revenue Loss from Churn: ${response_data['potential_revenue_loss']}
    - Churn Analysis by International Plan: {response_data['churn_by_international_plan']}
    - Churn Analysis by Voicemail Plan: {response_data['churn_by_voicemail']}
    - Churn Analysis by Time Spent: {response_data['churn_by_time_spent']}
    - Churn Analysis by Call Counts: {response_data['churn_by_calls_count']}

    **TASK:**
    - The above data is for medium risk churn customers
    - Analyze the above data and generate retention strategies tailored to the dataset.
    - Include recommendations on **pricing, customer service, loyalty programs, and engagement tactics**.
    - Explain why each strategy applies based on the given data.
    - Give exactly 1 strategy for each data sent
    - Title: Retention Strategies of Medium risk churners

    Provide the response in a structured, point-by-point format without subheadings.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    return response.text

def generate_retention_strategies_high(response_data):
    
    prompt = f"""
    You are an AI specializing in telecom customer churn analysis.
    Based on the provided churn insights, generate a **highly specific and data-driven** retention strategy.

    **Churn Insights:**
    - Key Features Contributing to Churn:
    - State-wise Churn Trends:{response_data['state_wise_churn_counts']}
    - Potential Revenue Loss from Churn: ${response_data['potential_revenue_loss']}
    - Churn Analysis by International Plan: {response_data['churn_by_international_plan']}
    - Churn Analysis by Voicemail Plan: {response_data['churn_by_voicemail']}
    - Churn Analysis by Time Spent: {response_data['churn_by_time_spent']}
    - Churn Analysis by Call Counts: {response_data['churn_by_calls_count']}

    **TASK:**
    - The above data is for high risk churn customers
    - Analyze the above data and generate retention strategies tailored to the dataset.
    - Include recommendations on **pricing, customer service, loyalty programs, and engagement tactics**.
    - Explain why each strategy applies based on the given data.
    - Title: Retention Strategies of High risk churners
    - Give exactly 1 strategy for each data sent


    Provide the response in a structured, point-by-point format without subheadings.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    return response.text

def save_strategies_to_pdf(strategy_text, file_path="retention_strategies.pdf"):
    """
    Save the AI-generated retention strategies into a properly formatted PDF.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, "Retention Strategies", ln=True, align="C")
    
    pdf.set_font("Arial", size=12)
    for line in strategy_text.split("\n"):
        pdf.multi_cell(0, 10, line)

    pdf.output(file_path)
    return file_path



@app.route('/predict', methods=['POST'])
def predict():
    global users
    file = request.files.get('file')
    print("Hit this endpoint")
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Read the CSV
    try:
        data = pd.read_csv(file)
        temp_data = data.copy()
        users = temp_data['user id']
    except Exception as e:
        return jsonify({'error': 'Invalid file format'}), 400
    
    # Preprocess the data
    try:
        data_processed = preprocess_data(data)
    except Exception as e:
        return jsonify({'error': f'Preprocessing failed: {str(e)}'}), 400
    
    # Make ensemble predictions
    ensemble_predictions = ensemble_data.predict(data_processed)


    temp_data['churn'] = ensemble_predictions

    #Calculate churn percentage
    churn_percentage = calculate_churn_percentage(ensemble_predictions)

    #Features contributing to churn
    feature_importance = get_feature_importance()

    potential_revenue_loss = calculate_potential_revenue_loss(temp_data, "0")

    #Customer segmentation count
    category_counts = get_customer_segmentation_count(data_processed)

    state_wise_churn_counts = get_statewise_churn(temp_data, ensemble_predictions, "0")

    churn_by_international_plan = churn_percentage_by_international_plan(temp_data, "0")

    churn_by_voicemail = churn_percentage_by_voice_mail_plan(temp_data, "0")

    churn_by_time_spent = churn_percentage_by_time_spent(temp_data, "0") 

    churn_by_calls_count = churn_percentage_by_calls_count(temp_data, "0")

    churn_risk = find_churn_risk(churn_percentage)

    temp_data = assign_risk(data_processed, temp_data)

    state_wise_churn_counts_low = get_statewise_churn(temp_data, ensemble_predictions, "Low Risk")
    state_wise_churn_counts_medium = get_statewise_churn(temp_data, ensemble_predictions, "Medium Risk")
    state_wise_churn_counts_high = get_statewise_churn(temp_data, ensemble_predictions, "High Risk")

    potential_revenue_loss_low = calculate_potential_revenue_loss(temp_data, "Low Risk")
    potential_revenue_loss_medium = calculate_potential_revenue_loss(temp_data, "Medium Risk")
    potential_revenue_loss_high = calculate_potential_revenue_loss(temp_data, "High Risk")

    churn_by_international_plan_low = churn_percentage_by_international_plan(temp_data, "Low Risk")
    churn_by_international_plan_medium = churn_percentage_by_international_plan(temp_data, "Medium Risk")
    churn_by_international_plan_high = churn_percentage_by_international_plan(temp_data, "High Risk")

    churn_by_voicemail_low = churn_percentage_by_voice_mail_plan(temp_data, "Low Risk")
    churn_by_voicemail_medium = churn_percentage_by_voice_mail_plan(temp_data, "Medium Risk")
    churn_by_voicemail_high = churn_percentage_by_voice_mail_plan(temp_data, "High Risk")

    churn_by_time_spent_low = churn_percentage_by_time_spent(temp_data, "Low Risk") 
    churn_by_time_spent_medium = churn_percentage_by_time_spent(temp_data, "Medium Risk") 
    churn_by_time_spent_high = churn_percentage_by_time_spent(temp_data, "High Risk") 

    churn_by_calls_count_low = churn_percentage_by_calls_count(temp_data, "Low Risk")
    churn_by_calls_count_medium = churn_percentage_by_calls_count(temp_data, "Medium Risk")
    churn_by_calls_count_high = churn_percentage_by_calls_count(temp_data, "High Risk")






    response_low = {
        'state_wise_churn_counts': state_wise_churn_counts_low,
        'potential_revenue_loss': potential_revenue_loss_low,
        'churn_by_international_plan': churn_by_international_plan_low,
        'churn_by_voicemail': churn_by_voicemail_low,
        'churn_by_time_spent': churn_by_time_spent_low,
        'churn_by_calls_count': churn_by_calls_count_low,
    }

    

    response_medium = {
        'state_wise_churn_counts': state_wise_churn_counts_medium,
        'potential_revenue_loss': potential_revenue_loss_medium,
        'churn_by_international_plan': churn_by_international_plan_medium,
        'churn_by_voicemail': churn_by_voicemail_medium,
        'churn_by_time_spent': churn_by_time_spent_medium,
        'churn_by_calls_count': churn_by_calls_count_medium,
    }



    response_high = {
        'state_wise_churn_counts': state_wise_churn_counts_high,
        'potential_revenue_loss': potential_revenue_loss_high,
        'churn_by_international_plan': churn_by_international_plan_high,
        'churn_by_voicemail': churn_by_voicemail_high,
        'churn_by_time_spent': churn_by_time_spent_high,
        'churn_by_calls_count': churn_by_calls_count_high,
    }



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

    ai_strategies = generate_retention_strategies(response_data=response)
    ai_strategies_low = generate_retention_strategies_low(response_data=response_low)
    ai_strategies_medium = generate_retention_strategies_medium(response_data=response_medium)
    ai_strategies_high = generate_retention_strategies_high(response_data=response_high)

    combined_strategies = ai_strategies + "\n\n\n" + ai_strategies_high + "\n\n\n" + ai_strategies_medium + "\n\n\n" + ai_strategies_low

    pdf_file_path = save_strategies_to_pdf(combined_strategies) 

    return jsonify(response)

@app.route('/get-pdf', methods=['GET'])
def get_pdf():
    pdf_path = "retention_strategies.pdf"
    with open(pdf_path, "rb") as pdf_file:
        encoded_string = base64.b64encode(pdf_file.read()).decode('utf-8')
    return {"pdf_base64": encoded_string}

@app.route('/sample-format', methods=['GET'])
def download_sample_format():
    sample_data = {
        'user id':[1, 2],
        'state': ['KS', 'OH'],
        'account length': [128, 107],
        'area code': [415, 408],
        'phone number': ['382-4657', '371-7191'],
        'international plan': ['no', 'yes'],
        'voice mail plan': ['yes', 'no'],
        'number vmail messages': [25, 0],
        'total day minutes': [265.1, 162.6],
        'total day calls': [110, 123],
        'total day charge': [45.07, 27.64],
        'total eve minutes': [197.4, 243.4],
        'total eve calls': [99, 114],
        'total eve charge': [16.78, 20.69],
        'total night minutes': [244.7, 162.6],
        'total night calls': [91, 104],
        'total night charge': [11.01, 7.32],
        'total intl minutes': [10.0, 13.7],
        'total intl calls': [3, 3],
        'total intl charge': [2.7, 3.7],
        'customer service calls': [1, 3]
    }
    df = pd.DataFrame(sample_data)
    csv_data = df.to_csv(index=False)
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_format.csv"}
    )

@app.route('/churned_users', methods=['GET'])
def download_churned_users():
    print("Users", users)
    print("Risk Data", risk_data)
    data = {
        'user id': list(users),
        'category': list(risk_data)
    }
    df = pd.DataFrame(data)
    csv_data = df.to_csv(index=False)
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=churned_users.csv"}
    )




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
