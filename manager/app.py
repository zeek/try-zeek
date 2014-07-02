from flask import Flask, render_template, request
from flask import jsonify
import backend
import hashlib

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
    version = request.json.get('version', '')
    if pcap and '--' in pcap:
        pcap = None

    job_id = backend.queue_run_code(sources, pcap=pcap, version=version)

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

@app.route("/files/<job>.json")
def files_json(job):
    files = backend.get_files_json(job)
    return jsonify(files=files)

@app.route("/versions.json")
def versions():
    return jsonify(versions=backend.BRO_VERSIONS, default=backend.BRO_VERSION)

@app.route("/pcap/upload/<checksum>", methods=['POST'])
def pcap_upload(checksum):
    contents = request.files['pcap'].read()
    actual = md5(contents)
    ok = actual == checksum
    if ok:
        backend.save_pcap(checksum, contents)
    return jsonify(status=ok, checksum=actual)

@app.route("/pcap/<checksum>")
def has_pcap(checksum):
    status = backend.check_pcap(checksum)
    return jsonify(status=status)

def md5(s):
    m = hashlib.md5()
    m.update(s)
    return m.hexdigest()

if __name__ == "__main__":
    app.run(debug=True)
