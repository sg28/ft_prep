from flask import Flask, render_template, request, redirect
import os
import joblib  # To load the pre-trained model

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load your pre-trained model saved as model.pkl
model = joblib.load('model.pkl')

def extract_features(code_text):
    # Dummy feature extraction: count lines and average line length
    lines = code_text.splitlines()
    num_lines = len(lines)
    avg_length = sum(len(line) for line in lines) / num_lines if num_lines > 0 else 0
    return [[num_lines, avg_length]]  # Model expects a 2D array

@app.route('/', methods=['GET', 'POST'])
def index():
    prediction = None
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                code_text = f.read()
            features = extract_features(code_text)
            prediction = model.predict(features)[0]
    return render_template('index.html', prediction=prediction)

if __name__ == '__main__':
    app.run(debug=True)
