const { test, expect, describe } = require("@jest/globals");
const process = require("process");
const childProcess = require("child_process");

const indexModulePath = "index.js";

const spawnIndexModule = (level) => {
    return childProcess.spawn(process.argv[0], [indexModulePath, level]);
};

describe("Filter by level", () => {
    test("filters out low level entries", (done) => {
        const level = 30;
        const proc = spawnIndexModule(level);

        const expected = `{"level":40}\n{}\n{"level":40}\n{"level":30}\n`;

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.stdout.on("end", (data) => {
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

    test("fails on missing argument", (done) => {
        const level = "";

        const proc = spawnIndexModule(level);

        proc.on("exit", (code) => {
            expect(code).not.toEqual(0);
            done();
        });
    });

    test("fails on invalid argument", (done) => {
        const level = "non-numeric";

        const proc = spawnIndexModule(level);

        proc.on("exit", (code) => {
            expect(code).not.toEqual(0);
            done();
        });
    });
});
