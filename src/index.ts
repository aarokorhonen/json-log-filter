import readline from "readline";
import { parseConfigFromArgs } from "./args";

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const config = parseConfigFromArgs(process.argv.slice(2));

// Note: Using 'any' here mimics the signature of JSON.parse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseLine = (line: string): any => {
    try {
        const entry = JSON.parse(line);
        return entry;
    } catch (err) {
        console.error(`Invalid JSON line: "${line}" (${err})`);
        process.exit(1);
    }
};

rl.on("line", (line) => {
    const entry = parseLine(line);
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
});
