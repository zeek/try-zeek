import fetch from 'isomorphic-fetch';

import { tbhistory, setHistoryToExample } from './tbhistory';
import md5 from 'md5';

export const VERSIONS_FETCHING  = 'VERSIONS_FETCHING';
export const VERSIONS_FETCHED   = 'VERSIONS_FETCHED';
export const VERSIONS_SET       = 'VERSIONS_SET';


export function fetchingVersions() {
    return {
        type: VERSIONS_FETCHING,
    };
}

export function fetchedVersions(version_data) {
    return {
        type: VERSIONS_FETCHED,
        versions: version_data.versions,
        version: version_data['default']
    };
}
export function setVersion(version) {
    return {
        type: VERSIONS_SET,
        version: version
    };
}

export function fetchVersions() {
  return dispatch => {
    dispatch(fetchingVersions());
    return fetch(`/versions.json`)
      .then(response => response.json())
      .then(json => dispatch(fetchedVersions(json)));
  };
}

export const EXAMPLES_FETCHING  = 'EXAMPLES_FETCHING';
export const EXAMPLES_FETCHED   = 'EXAMPLES_FETCHED';
export const EXAMPLES_SET       = 'EXAMPLES_SET';

export const EXAMPLE_SELECTED  = 'EXAMPLE_SELECTED';
export const EXAMPLE_HIDE      = 'EXAMPLE_HIDE';
export const EXAMPLE_SHOW      = 'EXAMPLE_SHOW';


export function fetchingExamples() {
    return {
        type: EXAMPLES_FETCHING,
    };
}

export function fetchExamples() {
  return dispatch => {
    dispatch(fetchingExamples());
    return fetch(`/static/examples/examples.json`)
      .then(response => response.json())
      .then(json => dispatch(fetchedExamples(json)));
  };
}

export function fetchedExamples(examples) {
    return {
        type: EXAMPLES_FETCHED,
        examples: examples
    };
}

export function loadExample(example, run=false) {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.examples.fetched) {
            dispatch(fetchExamples()).then(() => {
                dispatch(selectExample(example, run));
            });
        } else {
            dispatch(selectExample(example, run));
        }
    }
}

export function selectExample(example, run=false) {
    return (dispatch, getState) => {
        dispatch({ type: EXAMPLE_SELECTED, path: example})
        const state = getState();
        example = state.examples.example;
        dispatch(setCode(example.sources));
        if (example.pcaps.length)
            dispatch(pcapSelected(example.pcaps[0]))
        if(run)
            dispatch(execSubmit());
    };
};

export function hideExample() {
    return {
        type: EXAMPLE_HIDE,
    };
}
export function showExample() {
    return {
        type: EXAMPLE_SHOW,
    };
}

export const CODE_SET = 'CODE_SET';
export const CODE_SELECT_FILE = 'CODE_SELECT_FILE';
export const CODE_ADD_FILE = 'CODE_ADD_FILE';
export const CODE_RENAME_FILE = 'CODE_RENAME_FILE';
export const CODE_EDIT_FILE = 'CODE_EDIT_FILE';

export function setCode(sources) {
    return {
        type: CODE_SET,
        sources
    }
}

export function codeSelectFile(name) {
    return {
        type: CODE_SELECT_FILE,
        name
    }
}

export function codeAddFile() {
    return {
        type: CODE_ADD_FILE,
    }
}
export function codeRenameFile(new_name) {
    return {
        type: CODE_RENAME_FILE,
        new_name,
    }
}

export function codeEditFile(name, contents) {
    return {
        type: CODE_EDIT_FILE,
        name,
        contents
    }
}

export const EXEC_RUNNING = 'EXEC_RUNNING'
export const EXEC_COMPLETE = 'EXEC_COMPLETE'

export const EXEC_FETCHING_FILES = 'EXEC_FETCHING_FILES'
export const EXEC_FETCHED_FILES = 'EXEC_FETCHED_FILES'

export const EXEC_RESET = 'EXEC_RESET'

export function execReset(){
    return {
        type: EXEC_RESET
    }
}

export function execSubmit(pcap_uploaded) {
    return (dispatch, getState) => {
        const state = getState();
        const sources = state.code.sources;
        const version = state.versions.version;
        const pcap = state.pcap.pcap;
        const pcapfile = state.pcap.file;
        if (pcapfile !== null && pcap_uploaded !== true) {
            return upload_and_reexec(dispatch, pcapfile);
        }
        var opts =  {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sources: sources,
                version: version,
                pcap: pcap
            })
        };
        dispatch(execRunning());
        return fetch('/run', opts)
            .then(response => response.json())
            .then(json => {
                dispatch(execComplete(json));
                dispatch(execFetchFiles(json.job));
                tbhistory.push({ pathname: '/trybro/saved/' + json.job});
            });
    };
}

function upload_and_reexec(dispatch, file) {
    var reader = new FileReader();
    reader.onloadend = function () {
        var checksum = md5(reader.result, {encoding: 'binary'});
        check_or_upload_pcap(dispatch, file, checksum);
    }
    reader.readAsBinaryString(file);
}

function check_or_upload_pcap(dispatch, file, checksum){
    fetch('/pcap/' + checksum)
        .then(response => response.json())
        .then(response => {
            if (response.status) {
                //pcap already exists on server
                dispatch(pcapSelected(checksum));
                dispatch(execSubmit(true));
            } else {
                upload_pcap(dispatch, file, checksum);
            }
        });
}

function upload_pcap(dispatch, file, checksum) {
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            dispatch(pcapProgress(percentage));
        }
    }, false);
    xhr.upload.addEventListener('load', function(e){
        dispatch(pcapUploaded(checksum));
        dispatch(execSubmit(true));
    }, false);

    var fd = new FormData();
    fd.append('pcap', file);

    xhr.open('POST', '/pcap/upload/' + checksum, true);
    xhr.send(fd);
}

export function execFetchFiles(job) {
    return dispatch => {
        dispatch(execFetchingFiles())
        return fetch(`/files/${job}.json`)
            .then(response => response.json())
            .then(json => dispatch(execFetchedFiles(json.files)));
    }
}
export function execFetchingFiles() {
    return {
        type: EXEC_FETCHING_FILES
    }
}

export function execFetchedFiles(files) {
    return {
        type: EXEC_FETCHED_FILES,
        files
    }
}

export function execRunning() {
    return {
        type: EXEC_RUNNING
    }
}

export function execComplete(response) {
    return {
        type: EXEC_COMPLETE,
        response
    }
}

export const PCAP_SELECTED = 'PCAP_SELECTED'
export const PCAP_FILE_CHANGED = 'PCAP_FILE_CHANGED'
export const PCAP_UPLOAD_PROGRESS = 'PCAP_UPLOAD_PROGRESS'
export const PCAP_UPLOADED = 'PCAP_UPLOADED'

export function pcapSelected(pcap) {
    return {
        type: PCAP_SELECTED,
        pcap
    }
}


export function pcapFileChanged(file) {
    return {
        type: PCAP_FILE_CHANGED,
        file
    }
}

export function pcapProgress(pct) {
    return {
        type: PCAP_UPLOAD_PROGRESS,
        pct
    }
}
export function pcapUploaded(checksum) {
    return {
        type: PCAP_UPLOADED,
        checksum
    }
}

export function loadSaved(job, autorun) {
    return dispatch => {
        return fetch(`/saved/${job}`)
            .then(response => response.json())
            .then(json => {
                dispatch(setCode(json.sources));
                dispatch(setVersion(json.version));
                dispatch(pcapSelected(json.pcap));
                if (autorun)
                    dispatch(execSubmit());
            });
    }
}


import queryString from 'query-string'

export function handleLocationChange(dispatch, location, initial=false) {
    console.log('Location is now', location);
    var match = /\/trybro\/saved\/(\d+)/.exec(location.pathname);
    if (match) {
        var job = match[1];
        return dispatch(loadSaved(job, initial));
    }
    const query = queryString.parse(location.search);
    if(query) {
        var q = query;
        if (q.pcap)
            dispatch(pcapSelected(q.pcap));
        if (q.version)
            dispatch(setVersion(q.version));
        if (q.example)
            dispatch(loadExample(q.example, q.run));
    }
    if(location.pathname === '/' && Object.keys(query).length === 0 && location.hash === '') {
        setHistoryToExample('hello');
    }
}
