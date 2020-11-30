import { test, expect, describe } from "@jest/globals";
import { parseConfigFromArgs } from "./args";
import {
    assertNotUndefined,
    runToCompletion,
    spawnIndexModule,
} from "./index.test";

describe("Arguments parsing", () => {
    test("Parses correct default config with empty argv", () => {
        const config = parseConfigFromArgs([]);
        expect(config).toEqual({
            invalidJson: "error",
        });
    });
});

describe("Usage with arguments", () => {
    test("Prints usage with --help", (done) => {
        assertNotUndefined(done);

        const proc = spawnIndexModule(["--help"]);

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.stderr.on("data", (error) => {
            console.error(String(error));
            done(error);
        });

        proc.on("exit", (exitCode) => {
            expect(output).toMatch(/Usage:.*/);
            expect(exitCode).toBe(0);
            done();
        });
    });

    test("Prints default config with --debug-print-config", async () => {
        const res = await runToCompletion(
            ["--debug-print-config"],
            '{ "skipped": true }'
        );
        expect(res.exitCode).toBe(0);
        expect(JSON.parse(res.stdout)).toEqual({ invalidJson: "error" });
        expect(res.stderr).toBe("");
    });

    test("Correctly identifies --help even when it's not the first arg", (done) => {
        assertNotUndefined(done);

        const proc = spawnIndexModule(["--min-level", "20", "--help"]);

        let output = "";

        proc.stdout.on("data", (data) => {
            output += String(data);
        });

        proc.stderr.on("data", (error) => {
            console.error(String(error));
            done(error);
        });

        proc.on("exit", (exitCode) => {
            expect(output).toMatch(/Usage:.*/);
            expect(exitCode).toBe(0);
            done();
        });
    });

    test("Fails on unknown arguments", (done) => {
        assertNotUndefined(done);

        const proc = spawnIndexModule(["--bogus"]);

        let t = "";

        proc.stderr.on("data", (error) => {
            t += String(error);
        });

        proc.on("exit", (exitCode) => {
            expect(t).toMatch(/unknown.*--bogus/);
            expect(exitCode).not.toBe(0);
            done();
        });
    });

    test("Fails on unknown command", (done) => {
        assertNotUndefined(done);

        const proc = spawnIndexModule(["20"]);

        let t = "";

        proc.stderr.on("data", (error) => {
            t += String(error);
        });

        proc.on("exit", (exitCode) => {
            expect(t).toMatch(/command not supported: 20/);
            expect(exitCode).not.toBe(0);
            done();
        });
    });
});
