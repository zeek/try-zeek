var BroErrorRegex = /(error|warning) in (.+), line ([0-9]+): (.+)/g;

export function parse_errors(stderr)
{
    var errors = {};
    var match = {};
    // eslint-disable-next-line
    while ((match = BroErrorRegex.exec(stderr)) !== null) {
        var type = match[1];
        var filename = match[2];
        var line = parseInt(match[3], 10);
        var text = match[4];

        filename = filename.replace(/^[/.]+/,'')
        filename = filename.replace('try.zeek', 'main.zeek');

        var errors_for_this_file = errors[filename] || [];
        errors_for_this_file.push({
            row: line-1,
            column: 0,
            type: type,
            text: text,
        });
        errors[filename] = errors_for_this_file;
    }
    return errors;
}
