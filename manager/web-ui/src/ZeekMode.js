import window from 'brace';
import 'brace/mode/java';

export class ZeekHighlightRules extends window.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
}

export default class ZeekMode extends window.acequire('ace/mode/java').Mode {
}
