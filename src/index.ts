import readline from "readline";
import chalk from "chalk";
import { parseConfigFromArgs } from "./args";

type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
    [x: string]: JsonValue;
}

type Entry = JsonObject;

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

const config = parseConfigFromArgs(process.argv.slice(2));

const parseLine = (line: string): Entry | null => {
    try {
        const entry = JSON.parse(line);
        if (typeof entry !== "object") {
            throw new Error(`Non-object JSON value (${typeof entry}): ${line}`);
        } else {
            return entry;
        }
    } catch (err) {
        if (config.invalidJson === "error") {
            console.error(`Invalid JSON line: "${line}" (${err})`);
            process.exit(1);
        } else {
            return null;
        }
    }
};

const onEntryPositive = (entry: Entry) => {
    const line = JSON.stringify(entry);
    const output = config.dryRun ? chalk.bold.green(line) : line;
    process.stdout.write(`${output}\n`);
};

const onEntryNegative = (entry: Entry) => {
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
    if (entry === null) return;
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
