from flask import Flask, render_template, request, redirect, make_response
from flask_jsonpify import jsonify
import glob
import hashlib
import os

import backend
import metrics
from format import fmt

class FlaskStaticCors(Flask):
    def send_static_file(self, filename):
        response = super(FlaskStaticCors, self).send_static_file(filename)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

app = FlaskStaticCors(__name__)

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file("favicon.ico")

@app.route('/mode-zeek.js')
def zeek_mode():
    return app.send_static_file("mode-zeek.js")

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/metrics")
def bro_metrics():
    return render_template('metrics.html', metrics=metrics.get())

@app.route("/metrics.json")
def bro_metrics_json():
    return cors_jsonify(**metrics.get())

@app.route("/saved/<job>")
def saved(job):
    return corsify(make_response(backend.get_saved(job)))

@app.route("/run", methods=['OPTIONS'])
def run_options_for_cors():
    return cors_jsonify(ok="ok")

@app.route("/run", methods=['POST'])
def run():
    sources = request.json.get('sources', '')
    pcap = request.json.get('pcap', '')
    version = request.json.get('version', '')
    if pcap and '--' in pcap:
        pcap = None

    job_id, stdout = backend.run_code(sources, pcap=pcap, version=version)
    return cors_jsonify(job=job_id, stdout=stdout)

@app.route("/run_simple", methods=['GET', 'POST'])
def run_simple():
    stdin = request.args.get("code") or request.form.get("code") or 'print "Huh?";'
    version = request.args.get("version") or request.form.get("version")

    files = backend.run_code_simple(stdin, version=version)
    return cors_jsonify(files=files)

@app.route("/stdout/<job>")
def stdout(job):
    txt = backend.get_stdout(job)
    if txt is None:
        return 'wait', 202
    return cors_jsonify(txt=txt)

@app.route("/files/<job>")
def files(job):
    files = backend.get_files(job)
    return cors_jsonify(files=files)

@app.route("/files/<job>.json")
def files_json(job):
    files = backend.get_files_json(job)
    return cors_jsonify(files=files)

@app.route("/versions.json")
def versions():
    default_version, versions = backend.zeek_versions_from_redis()
    return cors_jsonify(versions=versions, default=default_version)

@app.route("/pcap/upload/<checksum>", methods=['OPTIONS'])
def pcap_upload_options_for_cors(checksum):
    return cors_jsonify(ok="ok")

@app.route("/pcap/upload/<checksum>", methods=['POST'])
def pcap_upload(checksum):
    contents = request.files['pcap'].read()
    actual = md5(contents)
    ok = actual == checksum
    if ok:
        backend.save_pcap(checksum, contents)
    return cors_jsonify(status=ok, checksum=actual)

@app.route("/pcap/<checksum>")
def has_pcap(checksum):
    status = backend.check_pcap(checksum)
    return cors_jsonify(status=status)

@app.route("/example/<name>")
def example(name):
    return redirect("/#/trybro?example=%s" % name)

@app.route("/pcaps.json")
def pcap_list():
    paths = glob.glob(os.path.join(app.static_folder, "pcaps/*.pcap"))
    pcaps = list(map(os.path.basename, paths))
    return cors_jsonify(available=pcaps)

@app.route("/format", methods=['POST'])
def format():
    sources = request.json.get('sources', [])
    errors = {}
    for src in sources:
        # If anything goes wrong, just leave it unchanged.
        try:
            src['content'], error = fmt(src['content'])
            if error:
                errors[src['name']] = [error]
        except Exception as err:
            pass

    return cors_jsonify(sources=sources, errors=errors)

def md5(s):
    m = hashlib.md5()
    m.update(s)
    return m.hexdigest()

def cors_jsonify(**kwargs):
    response = jsonify(**kwargs)
    return corsify(response)

def corsify(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

app.debug = False

if __name__ == "__main__":
    app.run(debug=True)
