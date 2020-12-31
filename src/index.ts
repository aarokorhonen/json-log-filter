import readline from "readline";
import chalk from "chalk";
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
        if (config.invalidJson === "error") {
            console.error(`Invalid JSON line: "${line}" (${err})`);
            process.exit(1);
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onEntryPositive = (entry: any) => {
    const line = JSON.stringify(entry);
    const output = config.dryRun ? chalk.bold.green(line) : line;
    process.stdout.write(`${output}\n`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onEntryNegative = (entry: any) => {
    const line = JSON.stringify(entry);
    if (config.dryRun) {
        const output = chalk.gray(line);
        process.stdout.write(`${output}\n`);
    } else {
        return;
    }
};

rl.on("line", (line) => {
    const entry = parseLine(line);
    if (entry === undefined) return;
    if (
        typeof config.minLogLevel === "number" &&
        typeof entry.level === "number" &&
        entry.level < config.minLogLevel
    ) {
        onEntryNegative(entry);
    } else {
        onEntryPositive(entry);
    }
});
