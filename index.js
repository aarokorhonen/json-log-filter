const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const level = parseInt(process.argv[2], 10);

if (Number.isNaN(level)) {
    console.error("Invalid log level supplied!");
    process.exit(1);
} else {
    rl.on("line", function (line) {
        const entry = JSON.parse(line);
        if (entry.level && entry.level < level) {
            return;
        } else {
            const output = JSON.stringify(entry);
            process.stdout.write(`${output}\n`);
        }
    });
}
