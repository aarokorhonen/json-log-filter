import { test, expect, describe } from "@jest/globals";
import { assertDoneFn, spawnIndexModule } from "./index.test";

describe("Arguments parsing", () => {
    test("Prints usage with --help", (done) => {
        assertDoneFn(done);

        const proc = spawnIndexModule("--help");

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

    test("Correctly identifies --help even when it's not the first arg", (done) => {
        assertDoneFn(done);

        const proc = spawnIndexModule("20 --help");

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
});
