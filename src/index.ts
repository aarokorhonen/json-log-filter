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

type ParseLineResult =
    | { status: "success"; value: Entry }
    | { status: "failure"; err: unknown };

const parseLine = (line: string): ParseLineResult => {
    try {
        const entry = JSON.parse(line);
        if (typeof entry !== "object") {
            return { status: "failure", err: "Invalid JSON value" };
        } else {
            return { status: "success", value: entry };
        }
    } catch (err) {
        return { status: "failure", err: "JSON syntax error" };
    }
};

const onLineInvalid = (line: string, err?: unknown) => {
    if (config.invalidJson === "error") {
        console.error(`Invalid JSON line: "${line}" (${err})`);
        process.exit(1);
    } else if (config.invalidJson === "pass") {
        process.stdout.write(`${line}\n`);
    } else if (config.invalidJson === "skip") {
        return;
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
    const result = parseLine(line);
    if (result.status === "failure") {
        onLineInvalid(line, result.err);
    } else {
        const entry = result.value;
        if (
            typeof config.minLogLevel === "number" &&
            typeof entry.level === "number" &&
            entry.level < config.minLogLevel
        ) {
            onEntryNegative(entry);
        } else {
            onEntryPositive(entry);
        }
    }
});
