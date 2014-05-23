from flask import Flask, render_template, request
from flask import jsonify
import backend

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/run", methods=['POST'])
def run():
    code = request.json.get('code', '')

    job = backend.queue_run_code(code)

    return jsonify(job=job.id)

@app.route("/stdout/<job>")
def stdout(job):
    txt = backend.get_stdout(job)
    if not txt:
        return 'wait', 202
    return txt

@app.route("/files/<job>")
def files(job):
    files = backend.get_files(job)
    return jsonify(files=files)

if __name__ == "__main__":
    app.run(debug=True)
