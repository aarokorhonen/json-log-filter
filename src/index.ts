import readline from "readline";
import { parseConfigFromArgs } from "./args";

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const config = parseConfigFromArgs(process.argv.slice(2));

rl.on("line", (line) => {
    try {
        const entry = JSON.parse(line);
        if (
            typeof config.minLogLevel === "number" &&
            typeof entry.level === "number" &&
            entry.level < config.minLogLevel
        ) {
            return;
        } else {
            const output = JSON.stringify(entry);
            process.stdout.write(`${output}\n`);
        }
    } catch (err) {
        console.error(`Invalid JSON line: "${line}" (${err})`);
        process.exit(1);
    }
});
