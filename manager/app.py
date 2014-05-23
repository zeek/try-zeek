from flask import Flask, render_template, request
from flask import jsonify
import backend

app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/run", methods=['POST'])
def run():
    code = request.form.get('code', '')

    job = backend.queue_run_code(code)

    return jsonify(job=job.id)

if __name__ == "__main__":
    app.run(debug=True)
