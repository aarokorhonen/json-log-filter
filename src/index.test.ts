import { test, expect, describe } from "@jest/globals";
import process from "process";
import childProcess from "child_process";
import path from "path";
import assert from "assert";

const indexModulePath = path.resolve(__dirname, "index.js");

export const spawnIndexModule = (args: string | undefined) => {
    const nodePath = process.argv[0];
    const fullArgs =
        args !== undefined
            ? [indexModulePath, ...args.split(" ")]
            : [indexModulePath];
    return childProcess.spawn(nodePath, fullArgs);
};

export function assertDoneFn(
    doneFn: Function | undefined
): asserts doneFn is Function {
    assert(doneFn !== undefined, "Missing doneFn!");
}

describe("Filter by level", () => {
    test("filters out low level entries", (done) => {
        assertDoneFn(done);

        const level = 30;
        const proc = spawnIndexModule(String(level));

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
        assertDoneFn(done);

        const level = undefined;
        const proc = spawnIndexModule(level);

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
        assertDoneFn(done);

        const level = "non-numeric";

        const proc = spawnIndexModule(level);

        proc.on("exit", (code) => {
            expect(code).not.toEqual(0);
            done();
        });
    });
});
