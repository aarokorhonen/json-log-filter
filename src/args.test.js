const { test, expect, describe } = require("@jest/globals");
const { spawnIndexModule } = require("./index.test");

describe("Arguments parsing", () => {
    test("Prints usage with --help", (done) => {
        const proc = spawnIndexModule("--help");

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.on("exit", (exitCode) => {
            expect(output).toMatch(/Usage:.*/);
            expect(exitCode).toBe(0);
            done();
        });
    });
});
