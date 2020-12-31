import readline from "readline";
import chalk from "chalk";
import jmespath from "jmespath";
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

if (process.stdin.isTTY) {
    process.stderr.write(
        "Warning: This program is not designed to be run with interactive input.\n" +
            "Run with --help for usage information.\n" +
            "In the future, you may be able to optionally suppress this warning.\n",
    );
}

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
        const output = config.dryRun ? chalk.red(line) : line;
        process.stdout.write(`${output}\n`);
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

const isBelowMinLogLevel = (entry: Entry): boolean => {
    return (
        typeof config.minLogLevel === "number" &&
        typeof entry.level === "number" &&
        entry.level < config.minLogLevel
    );
};

const isExcludedWithFilterExpression = (entry: Entry): boolean => {
    if (typeof config.filterExpression === "undefined") {
        return false;
    } else {
        const expressionResult = jmespath.search(
            entry,
            config.filterExpression,
        );
        if (typeof expressionResult !== "boolean") {
            throw new Error(
                `Invalid filter expression (expecting return value type` +
                    ` 'boolean' but got ${typeof expressionResult})`,
            );
        } else {
            return !expressionResult;
        }
    }
};

rl.on("line", (line) => {
    const result = parseLine(line);
    if (result.status === "failure") {
        onLineInvalid(line, result.err);
    } else {
        const entry = result.value;

        const isPositive =
            !isBelowMinLogLevel(entry) &&
            !isExcludedWithFilterExpression(entry);

        if (isPositive) {
            onEntryPositive(entry);
        } else {
            onEntryNegative(entry);
        }
    }
});
