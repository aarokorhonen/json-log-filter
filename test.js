const { test, expect } = require("@jest/globals");
const process = require("process");
const childProcess = require("child_process");

test("Filter by level", (done) => {
    const indexModulePath = "index.js";
    const level = "30";

    const proc = childProcess.spawn(process.argv[0], [indexModulePath, level]);

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
