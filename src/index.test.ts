import { test, expect, describe } from "@jest/globals";
import process from "process";
import childProcess, { ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import assert from "assert";

const indexModulePath = path.resolve(__dirname, "index.js");

export const spawnIndexModule = (
    args: string[]
): ChildProcessWithoutNullStreams => {
    const nodePath = process.argv[0];
    const fullArgs =
        args !== undefined ? [indexModulePath, ...args] : [indexModulePath];
    return childProcess.spawn(nodePath, fullArgs);
};

interface RunToCompletionResults {
    exitCode: number;
    stdout: string;
    stderr: string;
}

export const runToCompletion = (
    args: string[],
    input: string,
    opts?: Partial<childProcess.SpawnOptionsWithoutStdio>
): Promise<RunToCompletionResults> =>
    new Promise((resolve) => {
        const nodePath = process.argv[0];
        const fullArgs =
            args !== undefined ? [indexModulePath, ...args] : [indexModulePath];

        const proc = childProcess.spawn(nodePath, fullArgs, opts);

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => {
            stdout += String(data);
        });

        proc.stderr.on("data", (data) => {
            stderr += String(data);
        });

        proc.stdin.end(input);

        proc.on("exit", (exitCode) => {
            assert(exitCode !== null);
            resolve({
                exitCode,
                stdout,
                stderr,
            });
        });
    });

export function assertNotUndefined<T>(
    doneFn: T | undefined
): asserts doneFn is T {
    assert(doneFn !== undefined, "Unexpected 'undefined' value");
}

describe("Filter by level", () => {
    test("filters out low level entries", (done) => {
        assertNotUndefined(done);

        const level = 30;
        const proc = spawnIndexModule(["--min-level", `${level}`]);

        const expected = `{"level":40}\n{}\n{"level":40}\n{"level":30}\n`;

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.stdout.on("end", () => {
            expect(output).toEqual(expected);
            done();
        });

        proc.stderr.on("data", (error) => {
            console.error(String(error));
            done(error);
        });

        proc.stdin.write('{ "level": 40 }\n');
        proc.stdin.write("{  }\n");
        proc.stdin.write('{ "level": 40 }\n');
        proc.stdin.write('{ "level": 30 }\n');
        proc.stdin.end('{ "level": 20 }\n');
    });

    test("filters out nothing if no argument supplied", (done) => {
        assertNotUndefined(done);

        const proc = spawnIndexModule([]);

        const expected = `{"level":10}\n{"level":0}\n{"level":-10}\n`;

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.stdout.on("end", () => {
            expect(output).toEqual(expected);
            done();
        });

        proc.stderr.on("data", (error) => {
            console.error(String(error));
            done(error);
        });

        proc.stdin.write('{ "level": 10 }\n');
        proc.stdin.write('{ "level": 0 }\n');
        proc.stdin.end('{ "level": -10 }\n');
    });

    test("fails on invalid argument", (done) => {
        assertNotUndefined(done);

        const level = "non-numeric";

        const proc = spawnIndexModule(["--min-level", level]);

        proc.on("exit", (code) => {
            expect(code).not.toEqual(0);
            done();
        });
    });
});

describe("Invalid JSON handling", () => {
    test("supports '--invalid-json error'", async () => {
        const res = await runToCompletion(
            ["--invalid-json", "error"],
            '{ "i": 1 }\n{ invalid: invalid }\n{ "i": 2 }'
        );

        expect(res.exitCode).toBe(1);
        expect(res.stdout).toBe('{"i":1}\n');
        expect(res.stderr).toMatch("Invalid JSON line");
    });

    test("supports '--invalid-json skip'", async () => {
        const res = await runToCompletion(
            ["--invalid-json", "skip"],
            '{ "i": 1 }\n{ invalid: invalid }\n{ "i": 2 }'
        );

        expect(res).toEqual({
            exitCode: 0,
            stdout: '{"i":1}\n{"i":2}\n',
            stderr: "",
        });
    });

    test("supports '--invalid-json pass'", async () => {
        const res = await runToCompletion(
            ["--invalid-json", "pass"],
            '{ "i": 1 }\n"foobar"\n123\nstring\n{ invalid: invalid }\n{ "i": 2 }'
        );

        expect(res).toEqual({
            exitCode: 0,
            stdout:
                '{"i":1}\n"foobar"\n123\nstring\n{ invalid: invalid }\n{"i":2}\n',
            stderr: "",
        });
    });

    test("counts non-object JSON lines as invalid", async () => {
        const res = await runToCompletion(
            ["--invalid-json", "error"],
            '{ "i": 1 }\n123\n{ "i": 2 }'
        );

        expect(res.exitCode).toBe(1);
        expect(res.stdout).toBe('{"i":1}\n');
        expect(res.stderr).toMatch("Invalid JSON line");
    });
});

describe("Dry run", () => {
    test("prints gray and green lines corresponding to filter results", async () => {
        const res = await runToCompletion(
            ["--dry-run", "--min-level", "10"],
            '{ "level": 1 }\n{ "level": 12 }\n{ "level": 13 }\n{ "level": 4 }\n',
            { env: { FORCE_COLOR: "1" } }
        );

        expect(res.exitCode).toBe(0);
        expect(JSON.stringify(res.stdout)).toBe(
            '"\\u001b[90m{\\"level\\":1}\\u001b[39m\\n' +
                '\\u001b[1m\\u001b[32m{\\"level\\":12}\\u001b[39m\\u001b[22m\\n' +
                '\\u001b[1m\\u001b[32m{\\"level\\":13}\\u001b[39m\\u001b[22m\\n' +
                '\\u001b[90m{\\"level\\":4}\\u001b[39m\\n"'
        );
        expect(res.stderr).toBe("");
    });
});
