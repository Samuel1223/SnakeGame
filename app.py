from flask import Flask, render_template, request, jsonify, send_from_directory
import random
import json
import os
import time

app = Flask(__name__)

# Store high scores and game settings
SCORES_FILE = "scores.json"
SETTINGS_FILE = "settings.json"

# Default settings
DEFAULT_SETTINGS = {
    "difficulty": "medium",
    "theme": "classic",
    "sound": True,
    "obstacles": False
}

# Create necessary files if they don't exist
if not os.path.exists(SCORES_FILE):
    with open(SCORES_FILE, "w") as f:
        json.dump([], f)

if not os.path.exists(SETTINGS_FILE):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(DEFAULT_SETTINGS, f)

# Create static folder for assets if it doesn't exist
if not os.path.exists("static"):
    os.makedirs("static")
if not os.path.exists("static/sounds"):
    os.makedirs("static/sounds")
if not os.path.exists("static/images"):
    os.makedirs("static/images")

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

@app.route('/api/scores', methods=['GET'])
def get_scores():
    """Get the top 10 scores"""
    with open(SCORES_FILE, "r") as f:
        scores = json.load(f)
    
    # Sort scores by points (highest first)
    scores.sort(key=lambda x: x['score'], reverse=True)
    
    # Return only top 10
    return jsonify(scores[:10])

@app.route('/api/scores', methods=['POST'])
def save_score():
    """Save a new score"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'score' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    with open(SCORES_FILE, "r") as f:
        scores = json.load(f)
    
    # Add new score with timestamp
    scores.append({
        "name": data['name'],
        "score": data['score'],
        "date": time.strftime("%Y-%m-%d"),
        "difficulty": data.get('difficulty', 'medium')
    })
    
    # Save scores
    with open(SCORES_FILE, "w") as f:
        json.dump(scores, f)
    
    return jsonify({"success": True})

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get game settings"""
    with open(SETTINGS_FILE, "r") as f:
        settings = json.load(f)
    return jsonify(settings)

@app.route('/api/settings', methods=['POST'])
def save_settings():
    """Save game settings"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Invalid data"}), 400
    
    with open(SETTINGS_FILE, "r") as f:
        settings = json.load(f)
    
    # Update settings
    for key in data:
        if key in settings:
            settings[key] = data[key]
    
    # Save settings
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f)
    
    return jsonify({"success": True})

@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
