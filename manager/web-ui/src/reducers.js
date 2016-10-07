import { combineReducers } from 'redux';
import { VERSIONS_FETCHING, VERSIONS_FETCHED, VERSIONS_SET } from './actions';
import { EXAMPLES_FETCHING, EXAMPLES_FETCHED, EXAMPLES_LOAD, EXAMPLE_HIDE, EXAMPLE_SHOW } from './actions';
import { CODE_SET, CODE_ADD_FILE, CODE_SELECT_FILE, CODE_RENAME_FILE, CODE_EDIT_FILE } from './actions';
import { EXEC_RUNNING, EXEC_COMPLETE, EXEC_FETCHING_FILES, EXEC_FETCHED_FILES, EXEC_RESET } from './actions';
import { PCAP_SELECTED, PCAP_FILE_CHANGED, PCAP_UPLOAD_PROGRESS, PCAP_UPLOADED } from './actions';
import { parse_errors } from './broutil';

const initialVersionState = {
  fetching: false,
  versions: [],
  version: null
};

const initialExampleState = {
    fetching: false,
    examples: [],
    example: null,
    name: null,
    hidden: false
}
const initialCodeState = {
    sources: [{name:'main.bro', src:''}],
    current: 'main.bro',
    newCounter: 1
}

const initialExecState = {
    status: null,
    mode: 'text',
    stdout: null,
    stderr: null,
    files: null,
    visible: null,
    job: null,
    errors: {},
}

const initialPcapState = {
    pcap: null,
    file: null,
    available: ['exercise_traffic.pcap', 'ssh.pcap','http.pcap','sumstat.pcap'],
    uploaded: false,
    uploading: false,
    upload_progress: null,
}

function versions(state = initialVersionState, action) {
  switch (action.type) {
  case VERSIONS_SET:
    return Object.assign({}, state, {
      version: action.version
    });
  case VERSIONS_FETCHING:
    return Object.assign({}, state, {
      fetching: true,
    });
  case VERSIONS_FETCHED:
    return Object.assign({}, state, {
      fetching: false,
      versions: action.versions,
      version: action.version
    });
  default:
    return state;
  }
}

function examples(state = initialExampleState, action) {
  switch (action.type) {
  case EXAMPLES_FETCHING:
    return Object.assign({}, state, {
      fetching: true,
    });
  case EXAMPLES_FETCHED:
    return Object.assign({}, state, {
      fetching: false,
      examples: action.examples,
    });
  case EXAMPLES_LOAD:
    return Object.assign({}, state, {
      fetching: false,
      example: action.example,
      name: action.example.name
    });
  case EXAMPLE_HIDE:
    return Object.assign({}, state, {
      hidden: true,
    });
  case EXAMPLE_SHOW:
    return Object.assign({}, state, {
      hidden: false,
    });
  default:
    return state;
  }
}

function code(state = initialCodeState, action) {
  switch (action.type) {
  case CODE_SET:
    return Object.assign({}, state, {
      sources: action.sources,
      current: action.sources[0].name,
      newCounter: 1
    });
  case CODE_ADD_FILE:
    var new_filename = `new-${state.newCounter}.bro`;
    return Object.assign({}, state, {
      sources: [...state.sources, {name: new_filename, content: '#'}],
      current: new_filename,
      newCounter: state.newCounter + 1
    });
  case CODE_RENAME_FILE:
    var new_sources = [];
    state.sources.map( s => {
        if(s.name !== state.current) {
            new_sources.push(s);
        } else {
            new_sources.push({
                name: action.new_name,
                content: s.content
            })
        }
    })
    return Object.assign({}, state, {
        sources: new_sources,
        current: action.new_name
    })
  case CODE_SELECT_FILE:
    return Object.assign({}, state, {
      current: action.name
    });
  case CODE_EDIT_FILE:
    var new_sources = [];
    state.sources.map( s => {
        if(s.name !== action.name) {
            new_sources.push(s);
        } else {
            new_sources.push({
                name: action.name,
                content: action.contents
            })
        }
    })
    return Object.assign({}, state, {
        sources: new_sources
    })
  default:
    return state;
  }
}

function exec(state = initialExecState, action) {
    switch (action.type) {
    case EXEC_RESET:
        return initialExecState;
    case EXEC_RUNNING:
        return Object.assign({}, state, {
            status: 'Running...',
            files: null,
            stdout: null,
            stderr: null
        });
    case EXEC_COMPLETE:
        return Object.assign({}, state, {
            stdout: action.response.stdout,
            job: action.response.job,
            status: null,
        });
    case EXEC_FETCHING_FILES:
        return Object.assign({}, state, {
            status: 'Fetching files...'
        });
    case EXEC_FETCHED_FILES:
        var files = action.files;
        var stderr = files['stderr.log'];
        delete(files['stderr.log']);
        delete(files['stdout.log']);
        return Object.assign({}, state, {
            status: null,
            files: files,
            stderr: stderr,
            errors: parse_errors(stderr)
        });
    default:
        return state;
    }
}

function pcap(state = initialPcapState, action) {
    switch (action.type) {
    case PCAP_SELECTED:
        return { ...initialPcapState,
            pcap: action.pcap,
        }
    case PCAP_FILE_CHANGED:
        return { ...state,
            pcap: null,
            file: action.file,
            too_large: action.file.size > 10*1024*1024,
            uploaded: false,
            uploading: false,
            upload_progress: null,
        }
    case PCAP_UPLOAD_PROGRESS:
        return { ...state,
            uploaded: false,
            uploading: true,
            upload_progress: action.pct,
        }
    case PCAP_UPLOADED:
        return { ...state,
            pcap: action.checksum,
            uploaded: true,
            uploading: false,
            upload_progress: null,
        }
    default:
        return state;
    }
}

const tryBroApp = combineReducers({
  versions,
  examples,
  code,
  pcap,
  exec
});

export default tryBroApp;

