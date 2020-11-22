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

        proc.on("exit", (exitCode) => {
            expect(output).toMatch(/Usage:.*/);
            expect(exitCode).toBe(0);
            done();
        });
    });
});
