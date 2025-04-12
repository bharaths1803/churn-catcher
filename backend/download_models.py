import  zipfile, gdown, os

def download_models():

# Google Drive file ID
    file_id = "1bhxhNqkjRCw4NHF0SvHcHc18MrOrvy1C"
    
    # Output zip path
    output = "models_bundle_downloaded.zip"
    
    # Download from Google Drive
    gdown.download(f"https://drive.google.com/uc?id={file_id}", output, quiet=False)
    
    # Extract
    with zipfile.ZipFile(output, 'r') as zip_ref:
        zip_ref.extractall("ml/new_models")  # Adjust this if needed
    
    print("✅ Models downloaded and extracted successfully.")
    
    # Optional: remove the zip file
    os.remove(output)
