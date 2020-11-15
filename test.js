const process = require("process");
const childProcess = require("child_process");

const indexModulePath = "index.js";
const level = "30";

const p = childProcess.spawn(process.argv[0], [indexModulePath, level]);

const expected = `{"level":40}
{}
{"level":40}
{"level":30}
`;

let t = "";

p.stdout.on("data", (data) => {
    console.log(String(data));
    t += String(data);
});

p.stdout.on("end", (data) => {
    const result = t === expected;
    const exitCode = result ? 0 : 1;
    process.exitCode = exitCode;
});

p.stderr.on("data", (data) => {
    console.error(String(data));
});

p.stdin.write('{ "level": 40 }\n');
p.stdin.write("{  }\n");
p.stdin.write('{ "level": 40 }\n');
p.stdin.write('{ "level": 30 }\n');
p.stdin.end('{ "level": 20 }\n');
