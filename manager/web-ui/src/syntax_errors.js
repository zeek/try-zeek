import Parser from 'web-tree-sitter';
import treeSitterWasmUrl from "web-tree-sitter/tree-sitter.wasm";
import treeSitterZeekUrl from './tree-sitter-zeek.wasm';
const parser = (async () => {
    const Module = {
        locateFile: (path, prefix) => {
            // Hook into loading of the WASM code for web-tree-sitter, see
            // https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md#user-content-loading-the-wasm-file.
            // We only want to hook into that WASM file while we load the Zeek
            // language WASM file explicitly. Since we use webpack return the
            // webpack resource instead of some naked path.
            if (path === 'tree-sitter.wasm') {
                return treeSitterWasmUrl;
            }
            return '';
        },
    };
    await Parser.init(Module);

    const parser = new Parser;
    const Zeek = await Parser.Language.load(treeSitterZeekUrl);
    parser.setLanguage(Zeek);
    return parser;
})();

export async function check_syntax(code, level) {
    // The concrete parser instance. Since we reuse the
    // same parser instance reset it to a clean state.
    let p = await parser;
    p.reset();

    const tree = p.parse(code);
    const root = tree.rootNode;

    if (!root.hasError)
        return new Array;

    // Map uniquely tying CST node IDs to error messages.
    let errors = new Map;

    // Walk the CST.
    const cur = root.walk();
    let visitedChildren = false;

    while (true) {
        let start = cur.startPosition;
        let end = cur.endPosition;
        if (cur.nodeIsMissing) {
            errors.set(cur.currentNode.id, {start: start, end: end, diag: "Possibly missing '" + cur.currentNode.type + "'"});
        } else if (cur.currentNode.isError) {
            errors.set(cur.currentNode.id, {start: start, end: end, diag: "Syntax error"});
        }

        if (visitedChildren) {
            if (cur.gotoNextSibling()) {
                visitedChildren = false;
            } else if (cur.gotoParent()) {
                visitedChildren = true;
            } else {
                break;
            }
        } else {
            if (cur.gotoFirstChild()) {
                visitedChildren = false;
            } else {
                visitedChildren = true;
            }
        }
    }

    cur.delete();

    // Create an errors array suitable for ACE.
    let errs = new Array;
    for (const err of errors.values()) {
        errs.push({
            row: err.start.row,
            column: err.start.column,
            text: err.diag,
            type: level,
        })
    }

    return errs;
}
