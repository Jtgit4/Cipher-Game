from flask import Flask, jsonify, request, send_from_directory
import random
import os

app = Flask(__name__, static_folder='.')

# Serving the index.html file at the root URL
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

cipher_texts = [
    "We don't plan for failure, but hope is not a strategy",
    "If_at_first_you_don't_succeed,_try_and_try_again",
    "test",
    "test_oooooo",
    "test_oooo",
    "test_test"
    # Add more cipher texts here
]

def generate_cipher():
    alphabet = list("abcdefghijklmnopqrstuvwxyz")
    cipher = alphabet.copy()
    random.shuffle(cipher)
    return dict(zip(alphabet, cipher))

def encode_string(text, cipher):
    encoded_text = ""
    for char in text:
        if char.isalpha():
            if char.isupper():
                encoded_text += cipher.get(char.lower()).upper()
            else:
                encoded_text += cipher.get(char)
        else:
            encoded_text += char
    return encoded_text

@app.route("/fetch_cipher_text", methods=["GET"])
def fetch_cipher_text():
    random_cipher_text = random.choice(cipher_texts)
    original_text = random_cipher_text
    cipher = generate_cipher()
    encoded_text = encode_string(random_cipher_text, cipher)
    return jsonify(cipher_text=encoded_text, original_text=original_text)



@app.route("/encode_string", methods=["POST"])
def encode_string_route():
    data = request.json
    text = data.get("text")
    cipher = generate_cipher()
    encoded_text = encode_string(text, cipher)
    return jsonify(encoded_text=encoded_text)

@app.route('/<path:path>')
def serve_static(path):
    root_dir = os.path.dirname(os.path.realpath(__file__))
    return send_from_directory(root_dir, path)

if __name__ == "__main__":
    app.run()
