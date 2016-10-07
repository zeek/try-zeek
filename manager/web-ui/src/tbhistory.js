import { createHashHistory } from 'history'
import queryString from 'query-string'

export const tbhistory = createHashHistory();

export function setHistoryToExample(example) {
    var q = queryString.stringify({example: example});
    tbhistory.push({pathname: '/', search: q});
}
