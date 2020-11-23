import arg from "arg";

const helpMessage = `\
Usage:          node index.js [minlevel]
Example usage:  node index.js 30

Options:        --help    Prints this message
`;

const printHelpMessage = () => {
    console.log(helpMessage);
};

const parseMinLogLevel = (minLevel: string | undefined): number | undefined => {
    if (minLevel === undefined) {
        return undefined;
    } else {
        const int = parseInt(minLevel, 10);
        if (Number.isNaN(int)) {
            console.error(`Invalid log level supplied: "${minLevel}"`);
            process.exit(1);
        } else {
            return int;
        }
    }
};

interface Config {
    minLogLevel: number | undefined;
}

export const parseConfigFromArgs = (slicedArgV: string[]): Config => {
    try {
        const args = arg(
            {
                "--help": Boolean,
                "--min-level": parseMinLogLevel,
            },
            {
                argv: slicedArgV,
                permissive: false,
            }
        );

        if (args._.length > 0) {
            throw new Error(`command not supported: ${args._[0]}`);
        }

        if (args["--help"]) {
            printHelpMessage();
            process.exit(0);
        }

        const config: Config = {
            minLogLevel: args["--min-level"],
        };

        return config;
    } catch (err) {
        console.error(String(err));
        console.error("  Run with --help to see usage\n");
        process.exit(1);
    }
};
