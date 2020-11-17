const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const parseMinLogLevel = (arg) => {
    if (arg === undefined) {
        return undefined;
    } else {
        const int = parseInt(arg, 10);
        if (Number.isNaN(int)) {
            console.error(`Invalid log level supplied: ${arg}`);
            process.exit(1);
        } else {
            return int;
        }
    }
};

const minLogLevelArgument = process.argv[2];

const minLogLevel = parseMinLogLevel(minLogLevelArgument);

rl.on("line", (line) => {
    const entry = JSON.parse(line);
    const isLevelFilterActive =
        typeof minLogLevel === "number" && typeof entry.level === "number";
    if (isLevelFilterActive && entry.level < minLogLevel) {
        return;
    } else {
        const output = JSON.stringify(entry);
        process.stdout.write(`${output}\n`);
    }
});
