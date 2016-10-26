import React, { Component } from 'react';
import './App.css';

import {connect} from 'react-redux';

import brace from 'brace';
import 'brace/mode/perl';
import 'brace/theme/github';

import AceEditor from 'react-ace';

import { fetchVersions, setVersion } from './actions';
import { fetchExamples, hideExample, showExample } from './actions';
import { codeAddFile, codeSelectFile, codeRenameFile, codeEditFile } from './actions';
import { execReset, execSubmit } from './actions';
import { pcapSelected, pcapFileChanged } from './actions';

import {Glyphicon, Tab, Tabs, Button, ButtonGroup} from 'react-bootstrap';
import {Pager} from 'react-bootstrap';
import {Grid, Row, Col} from 'react-bootstrap';
import {Table} from 'react-bootstrap';
import {Modal} from 'react-bootstrap';

import { setHistoryToExample } from './tbhistory';

var DropDown = ({options, includeBlank, selected, onChange}) => {
    if(includeBlank) {
        options = ['', ...options];
    }
    return (
        <select value={selected || ''} onChange={(e) => onChange(e.target.value)}>
          {options.map ? options.map(opt =>
            <option key={opt} value={opt}>{opt}</option>
          ) : null}
        </select>
    );
};


class BroVersions extends Component {
    change = v => this.props.onVersionChanged(v);
    render() {
        const { version, versions } = this.props.versions;
        return (
            <span>
                Bro Version
                <DropDown options={versions} selected={version} onChange={this.change} />
            </span>
        );
    }
};

//TODO: simpler way of doing this?
var ExampleDropDown = ({examples, includeBlank, selected, onChange}) => {
    var cur_selected = selected ? selected.path: '';
    return (
        <select value={cur_selected} onChange={(e) => onChange(e.target.value)}>
          {examples.map(ex =>
            <option key={ex.path} value={ex.path}>{ex.parent ? ex.parent + ':' : ''} {ex.title}</option>
          )}
        </select>
    );
}

class BroEditor extends Component {
    handleCodeChanged(file, c) {
        this.props.onCodeChanged(file, c);
    }
    handleSelect(key) {
        if(key === 'ADD') {
            this.props.onAddFile();
        } else if(this.props.code.current === key && this.props.code.current !== 'main.bro') {
            var new_name = prompt(`Rename ${this.props.code.current} to`, this.props.code.current);
            if (new_name && new_name !== '' && new_name !== this.props.code.current)
                this.props.onRenameFile(new_name);
        } else if(this.props.code.current !== key) {
            this.props.onSelectFile(key);
        }
    }

    render() {
        var add_button = <span><Glyphicon glyph="plus" /> Add File</span>
        return (
        <div>
            <Tabs animation={false} activeKey={this.props.code.current} onSelect={(e) => this.handleSelect(e)} id="Editor">
              {this.props.code.sources.map(c =>
              <Tab title={c.name} key={c.name} eventKey={c.name}>
                <AceEditor
                    width="100%"
                    showPrintMargin={false}
                    mode="perl"
                    theme="github"
                    name={c.name}
                    value={c.content}
                    annotations={this.props.errors[c.name]}
                    onChange={ (contents) => {
                        this.handleCodeChanged(c.name, contents)
                    }}
                    editorProps={{$blockScrolling: true}}
                />
              </Tab>
              )}
              <Tab title={add_button} key="add" eventKey="ADD">Add</Tab>
            </Tabs>
        </div>
    )}
}

class BroExampleReadme extends Component {
    render() {
        const { example, onChange } = this.props;
        if (!example || !example.html) {
            return null;
        }
        var markup = {__html: example.html }
        var prev = example.prev ? <Pager.Item previous onClick={() => onChange(example.prev.path)}>Previous is {example.prev.title} </Pager.Item> : null;
        var next = example.next ? <Pager.Item next     onClick={() => onChange(example.next.path)}>Next is {example.next.title} </Pager.Item> : null;
        return (
            <div>
                <Pager>
                    {prev}
                    {next}
                </Pager>
                <div dangerouslySetInnerHTML={markup} />
            </div>
        )
    }
}

var BroFileViewerDetailTable = ({record}) => {
    if (record == null)
        return null;
    return (
    <Table responsive striped condensed>
        <thead>
            <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            {record.map((r, id) =>
                <tr key={id}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                </tr>
            )}
        </tbody>
    </Table>
    )
}

class BroFileViewerModal extends Component {

  render() {
    const { file, recordNum, onPrev, onNext } = this.props;
    var record = null;
    var rowStatus = null;
    if (file && file.rows && file.rows.length && recordNum !== null) {
        var row = file.rows[recordNum]
        record = zip([file.header, file.types, row]);
        rowStatus = <span>Viewing record {recordNum+1} of {file.rows.length}</span>;
    }
    return (
      <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
          <ButtonGroup>
              <Button onClick={() => onPrev()} disabled={this.props.recordNum === 0}>Prev</Button>
              <Button onClick={() => onNext()} disabled={this.props.recordNum === file.rows.length -1}>Next</Button>
          </ButtonGroup>
          {rowStatus}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BroFileViewerDetailTable record={record} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class BroFileViewerTableTable extends Component {
    shouldComponentUpdate () {
        return false;
    }

    render() {
        const { file, onRowSelected } = this.props;
        return (
        <Table responsive striped condensed>
            <thead>
                <tr>
                    {file.header.map(h =>
                        <th key={h}>{h}</th>
                    )}
                </tr>
            </thead>
            <tbody className="Pointer">
                {file.rows.map((r, id) =>
                    <tr key={id} onClick={() => onRowSelected(file, r, id)}>
                        {r.map((c, cid) =>
                            <td key={id + ' ' + cid}><div className="overflow">{c}</div></td>
                        )}
                    </tr>
                )}
            </tbody>
        </Table>
        )
    }
}

class BroFileViewerTable extends Component {
    constructor(props) {
        super(props);
        this.state = {showDetail: false, detailRecordNum: null};
    }
    showDetails = (file, record, row) => {
        this.setState({showDetail: true, detailRecordNum: row});
    }
    hideDetails = () => {
        this.setState({showDetail: false});
    }
    showPrev = () => {
        this.setState({detailRecordNum: this.state.detailRecordNum-1});
    }
    showNext = () => {
        this.setState({detailRecordNum: this.state.detailRecordNum+1});
    }
    render() {
        const { file } = this.props;
        return (
        <div>
        <BroFileViewerModal
            show={this.state.showDetail}
            file={file}
            recordNum={this.state.detailRecordNum}
            onHide={this.hideDetails}
            onNext={this.showNext}
            onPrev={this.showPrev}
        />
        <BroFileViewerTableTable file={file} onRowSelected={this.showDetails} />
        </div>
        )
    }
}

var BroFileViewerText = ({file}) => (
    <pre>{file}</pre>
)

var BroFileViewerDetail = ({file}) => {
    if(file.header) {
        return <BroFileViewerTable file={file} />
    } else {
        return <BroFileViewerText file={file} />
    }
}

class BroFileViewer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.files !== this.props.files;
    }
    render() {
        const { files } = this.props;
        if(!files || Object.keys(files).length === 0) {
            return <div/>;
        }
        return (
            <div>
                <h2> Output Logs </h2>
                <Tabs animation={false} bsStyle='pills' id="Output Logs">
                {Object.keys(files).map( (f) =>
                    <Tab title={f.replace(/.log$/, '')} key={f} eventKey={f}>
                        <BroFileViewerDetail file={files[f]} />
                    </Tab>
                )}
                </Tabs>
            </div>
        )
    }
}


var RunButton = ({status, pcap, onClick}) => {
    if (pcap.too_large)
        return <Button disabled={true} bsStyle="danger">The selected PCAP is too large to upload</Button>;

    if (pcap.uploading)
        return <Button disabled={true} bsStyle="primary">Uploading pcap: {pcap.upload_progress}%</Button>;

    if (status)
        return <Button disabled={true} bsStyle="primary">{status}</Button>;

    return <Button bsStyle="primary" onClick={onClick}> <span>Run <Glyphicon glyph="play" /></span> </Button>;
}

var TextMessage = ({header, text, className}) => {
    if(!text) {
        return <div/>;
    }
    return (
        <div>
            <h2> { header } </h2>
            <pre className={className}>{ text }</pre>
        </div>
    );
}

export class App extends Component {
    componentDidMount() {
        console.log('App mounted!');
        this.props.dispatch(fetchExamples());
        this.props.dispatch(fetchVersions());
    }
    versionSelected = (version) => {
        this.props.dispatch(setVersion(version))
    }
    exampleSelected = (example) => {
        setHistoryToExample(example);
        this.props.dispatch(execReset())
    }
    hideExample = () => {
        this.props.dispatch(hideExample())
    }
    showExample = () => {
        this.props.dispatch(showExample())
    }
    addFile = () => {
        this.props.dispatch(codeAddFile());
    }
    renameFile = (new_name) => {
        this.props.dispatch(codeRenameFile(new_name));
    }
    selectFile = (name) => {
        this.props.dispatch(codeSelectFile(name));
    }
    codeChanged = (name, contents) => {
        this.props.dispatch(codeEditFile(name, contents));
    }
    pcapChanged = (pcap) => {
        this.refs.file.value=null;
        this.props.dispatch(pcapSelected(pcap));
    }
    runCode = () => {
        this.props.dispatch(execSubmit());
    }
    fileChanged = () => {
        var f = this.refs.file.files[0];
        this.props.dispatch(pcapFileChanged(f));
    }

    renderLoadLine() {
        const { examples } = this.props;
        var showHide = null;
        if ( examples.example && examples.example.html && examples.hidden)
            showHide = <span onClick={this.showExample} style={{cursor:'pointer'}}><Glyphicon glyph="eye-open" />Show text</span>;
        else
            showHide = <span onClick={this.hideExample} style={{cursor:'pointer'}}><Glyphicon glyph="remove" />Hide text</span>;

        return (
            <Row> <Col sm={12}>
                Load Example: <ExampleDropDown examples={examples.examples} selected={examples.example} onChange={this.exampleSelected}/>
                {showHide}
            </Col> </Row>
        );
    }

    renderCodeRow() {
        const { versions, examples, code, pcap, exec } = this.props;
        var editor = <BroEditor
            code={code}
            errors={exec.errors}
            onAddFile={this.addFile}
            onRenameFile={this.renameFile}
            onSelectFile={this.selectFile}
            onCodeChanged={this.codeChanged} />


        var editorBox = 
            <Grid fluid={true}>
                 <Row>
                     {editor}
                 </Row>
                 <Row>
                    <Row className="show-grid">
                        <Col sm={12} >
                        <BroVersions versions={versions} onVersionChanged={this.versionSelected} />
                        { '  ' }
                        Use PCAP: <DropDown includeBlank={true} options={pcap.available} selected={pcap.pcap} onChange={this.pcapChanged}/>
                        { '  ' }
                        Or { ' ' }
                        <label>
                            <input type="file" ref="file" onChange={this.fileChanged} />
                        </label>
                        <RunButton status={exec.status} pcap={pcap} onClick={this.runCode} />
                        </Col>
                    </Row>
                 </Row>
             </Grid>;


        if(examples.example && examples.example.html && !examples.hidden) {
            return (
                 <Row className="show-grid">
                     <Col sm={4}>
                         <BroExampleReadme example={examples.example} onChange={this.exampleSelected} />
                     </Col>
                     <Col sm={8}>
                        {editorBox}
                     </Col>
                </Row>
            );
        } else {
            return (
                <Row className="show-grid">
                    <Col sm={12}>
                        {editorBox}
                    </Col>
                </Row>
            );
        }
    }
    render() {
        const { exec } = this.props;
        return (
            <Grid fluid={true}>
                {this.renderLoadLine()}
                {this.renderCodeRow()}
                <TextMessage header='Errors' text={exec.stderr} className="alert alert-danger" />
                <TextMessage header='Output' text={exec.stdout} />
                <BroFileViewer job={exec.job} files={exec.files} />
            </Grid>
        );
    }
}

function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

function mapStateToProps(state) {
  return {
    versions: state.versions,
    examples: state.examples,
    code: state.code,
    pcap: state.pcap,
    exec: state.exec
  };
}

export default connect(mapStateToProps)(App);
