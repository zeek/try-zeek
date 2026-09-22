import reducer from './reducers';
import {
  fetchingVersions, fetchedVersions, setVersion,
  fetchingExamples, fetchedExamples, hideExample, showExample, EXAMPLE_SELECTED,
  setCode, codeAddFile, codeRenameFile, codeSelectFile, codeEditFile,
  execReset, execRunning, execComplete, execFetchingFiles, execFetchedFiles, setExecErrors,
  fetchingPcaps, fetchedPcaps, pcapSelected, pcapFileChanged, pcapProgress, pcapUploaded,
} from './actions';

// Initial combined state, obtained by feeding an unknown action.
const initial = () => reducer(undefined, { type: '@@INIT' });

describe('versions reducer', () => {
  it('has sane defaults', () => {
    expect(initial().versions).toEqual({ fetching: false, versions: [], version: null });
  });
  it('marks fetching', () => {
    expect(reducer(undefined, fetchingVersions()).versions.fetching).toBe(true);
  });
  it('stores versions and default on fetched', () => {
    const s = reducer(undefined, fetchedVersions({ versions: ['6.0', '7.0'], default: '7.0' }));
    expect(s.versions).toEqual({ fetching: false, versions: ['6.0', '7.0'], version: '7.0' });
  });
  it('sets the selected version', () => {
    expect(reducer(undefined, setVersion('6.0')).versions.version).toBe('6.0');
  });
});

describe('examples reducer', () => {
  const examples = [
    { path: 'hello', title: 'Hello', html: '<p>hi</p>' },
    { path: 'dns', title: 'DNS' },
  ];
  it('marks fetching', () => {
    expect(reducer(undefined, fetchingExamples()).examples.fetching).toBe(true);
  });
  it('stores examples and flips fetched', () => {
    const s = reducer(undefined, fetchedExamples(examples));
    expect(s.examples).toEqual({ fetching: false, fetched: true, examples, example: null, hidden: false });
  });
  it('selects an example by path', () => {
    let s = reducer(undefined, fetchedExamples(examples));
    s = reducer(s, { type: EXAMPLE_SELECTED, path: 'dns' });
    expect(s.examples.example).toEqual(examples[1]);
  });
  it('ignores selection of an unknown path', () => {
    let s = reducer(undefined, fetchedExamples(examples));
    s = reducer(s, { type: EXAMPLE_SELECTED, path: 'nope' });
    expect(s.examples.example).toBe(null);
  });
  it('toggles hidden via hide/show', () => {
    let s = reducer(undefined, hideExample());
    expect(s.examples.hidden).toBe(true);
    s = reducer(s, showExample());
    expect(s.examples.hidden).toBe(false);
  });
});

describe('code reducer', () => {
  it('starts with a single main.zeek', () => {
    expect(initial().code).toEqual({
      sources: [{ name: 'main.zeek', content: '' }], current: 'main.zeek', newCounter: 1,
    });
  });
  it('sets sources and selects the first', () => {
    const sources = [{ name: 'main.zeek', content: 'a' }, { name: 'b.zeek', content: 'b' }];
    const s = reducer(undefined, setCode(sources));
    expect(s.code).toEqual({ sources, current: 'main.zeek', newCounter: 2 });
  });
  it('adds a new file with an incrementing name and selects it', () => {
    const s = reducer(undefined, codeAddFile());
    expect(s.code.sources).toContainEqual({ name: 'new-1.zeek', content: '#' });
    expect(s.code.current).toBe('new-1.zeek');
    expect(s.code.newCounter).toBe(2);
  });
  it('selects a file', () => {
    const sources = [{ name: 'main.zeek', content: 'a' }, { name: 'b.zeek', content: 'b' }];
    let s = reducer(undefined, setCode(sources));
    s = reducer(s, codeSelectFile('b.zeek'));
    expect(s.code.current).toBe('b.zeek');
  });
  it('renames the current file, preserving content', () => {
    const sources = [{ name: 'main.zeek', content: 'a' }, { name: 'b.zeek', content: 'keep' }];
    let s = reducer(undefined, setCode(sources));
    s = reducer(s, codeSelectFile('b.zeek'));
    s = reducer(s, codeRenameFile('renamed.zeek'));
    expect(s.code.current).toBe('renamed.zeek');
    expect(s.code.sources).toContainEqual({ name: 'renamed.zeek', content: 'keep' });
    expect(s.code.sources.find((x) => x.name === 'b.zeek')).toBeUndefined();
  });
  it('edits a file\'s content by name', () => {
    let s = reducer(undefined, setCode([{ name: 'main.zeek', content: 'old' }]));
    s = reducer(s, codeEditFile('main.zeek', 'new'));
    expect(s.code.sources).toEqual([{ name: 'main.zeek', content: 'new' }]);
  });
});

describe('exec reducer', () => {
  it('resets to the initial exec state', () => {
    let s = reducer(undefined, execRunning());
    s = reducer(s, execReset());
    expect(s.exec).toEqual({ status: null, mode: 'text', stdout: null, stderr: null, files: null, visible: null, job: null, errors: {} });
  });
  it('marks running and clears prior output', () => {
    const s = reducer(undefined, execRunning());
    expect(s.exec).toEqual({ status: 'Running...', mode: 'text', stdout: null, stderr: null, files: null, visible: null, job: null, errors: {} });
  });
  it('stores stdout/job on complete', () => {
    const s = reducer(undefined, execComplete({ stdout: 'out', job: 'abc123' }));
    expect(s.exec).toEqual({ status: null, mode: 'text', stdout: 'out', stderr: null, files: null, visible: null, job: 'abc123', errors: {} });
  });
  it('marks fetching files', () => {
    expect(reducer(undefined, execFetchingFiles()).exec.status).toBe('Fetching files...');
  });
  it('strips stdout.log/stderr.log and parses errors on fetched files', () => {
    const files = {
      'conn.log': { header: ['id'], rows: [] },
      'stdout.log': 'out',
      'stderr.log': 'error in ./try.zeek, line 3: boom',
    };
    const s = reducer(undefined, execFetchedFiles(files));
    expect(s.exec.files['stdout.log']).toBeUndefined();
    expect(s.exec.files['stderr.log']).toBeUndefined();
    expect(s.exec.files['conn.log']).toBeDefined();
    expect(s.exec.stderr).toBe('error in ./try.zeek, line 3: boom');
    expect(s.exec.errors['main.zeek']).toEqual([
      { row: 2, column: 0, type: 'error', text: 'boom' },
    ]);
  });
  it('sets errors directly', () => {
    const errors = { 'main.zeek': [{ row: 0, column: 0, type: 'warning', text: 'x' }] };
    expect(reducer(undefined, setExecErrors(errors)).exec.errors).toEqual(errors);
  });
});

describe('pcap reducer', () => {
  it('marks fetching then fetched with available list', () => {
    let s = reducer(undefined, fetchingPcaps());
    expect(s.pcap.fetching).toBe(true);
    s = reducer(s, fetchedPcaps({ available: ['a.pcap', 'b.pcap'] }));
    expect(s.pcap).toEqual({ pcap: null, file: null, fetching: false, fetched: true, available: ['a.pcap', 'b.pcap'], uploaded: false, uploading: false, upload_progress: null });
  });
  it('selects a pcap and clears any uploaded file', () => {
    const s = reducer(undefined, pcapSelected('a.pcap'));
    expect(s.pcap).toEqual({ pcap: 'a.pcap', file: null, fetching: null, fetched: false, available: [], uploaded: false, uploading: false, upload_progress: null });
  });
  it('flags too_large above 10 MiB', () => {
    const big = reducer(undefined, pcapFileChanged({ size: 10 * 1024 * 1024 + 1 }));
    expect(big.pcap.too_large).toBe(true);
    const ok = reducer(undefined, pcapFileChanged({ size: 10 * 1024 * 1024 }));
    expect(ok.pcap.too_large).toBe(false);
    expect(ok.pcap.pcap).toBe(null);
  });
  it('tracks upload progress', () => {
    const s = reducer(undefined, pcapProgress(42));
    expect(s.pcap).toEqual({ pcap: null, file: null, fetching: null, fetched: false, available: [], uploaded: false, uploading: true, upload_progress: 42 });
  });
  it('records an uploaded checksum', () => {
    const s = reducer(undefined, pcapUploaded('deadbeef'));
    expect(s.pcap).toEqual({ pcap: 'deadbeef', file: null, fetching: null, fetched: false, available: [], uploaded: true, uploading: false, upload_progress: null });
  });
});
