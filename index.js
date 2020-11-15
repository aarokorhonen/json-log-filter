const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const level = process.argv[2];

rl.on("line", function (line) {
    const entry = JSON.parse(line);
    if (entry.level && entry.level < level) {
        return;
    } else {
        const output = JSON.stringify(entry);
        process.stdout.write(`${output}\n`);
    }
});
