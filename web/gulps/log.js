/**
 * Created by felix on 3/30/17.
 */

function log(message, fg_color = '', bg_color = '') {
    let coloredMsg = fg_color || bg_color ? `\u{1B}[${bg_color};${fg_color}m${message}\u{1B}[0m` : message;
    let msg = `[${(new Date()).toTimeString().substr(0, 8)}] ${coloredMsg}`;
    if (console !== undefined) {
        console.log(msg);
    }
}
// Foreground
log.FG_BLACK = 30;
log.FG_RED = 31;
log.FG_GREEN = 32;
log.FG_YELLOW = 33;
log.FG_BLUE = 34;
log.FG_PURPLE = 35;
log.FG_GREEN_DARK = 36;
log.FG_WHITE = 37;
// Background
log.BG_BLACK = 40;
log.BG_RED = 41;
log.BG_GREEN = 42;
log.BG_YELLOW = 43;
log.BG_BLUE = 44;
log.BG_PURPLE = 45;
log.BG_GREEN_DARK = 46;
log.BG_WHITE = 47;

module.exports = log;