from flask import Flask, render_template, request
from flask import jsonify
import backend

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/saved/<job>")
def saved(job):
    return backend.get_saved(job)

@app.route("/run", methods=['POST'])
def run():
    sources = request.json.get('sources', '')
    pcap = request.json.get('pcap', '')
    if pcap and '--' in pcap:
        pcap = None

    job_id = backend.queue_run_code(sources, pcap)

    return jsonify(job=job_id)

@app.route("/stdout/<job>")
def stdout(job):
    txt = backend.get_stdout(job)
    if txt is None:
        return 'wait', 202
    return jsonify(txt=txt)

@app.route("/files/<job>")
def files(job):
    files = backend.get_files(job)
    return jsonify(files=files)

if __name__ == "__main__":
    app.run(debug=True)
