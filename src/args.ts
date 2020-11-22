const helpMessage = `\
Usage:          node index.js [minlevel]
Example usage:  node index.js 30

Options:        --help    Prints this message
`;

const printHelpMessage = () => {
    console.log(helpMessage);
};

const parseMinLogLevel = (arg: string | undefined): number | undefined => {
    if (arg === undefined) {
        return undefined;
    } else {
        const int = parseInt(arg, 10);
        if (Number.isNaN(int)) {
            console.error(`Invalid log level supplied: ${arg}`);
            process.exit(1);
        } else {
            return int;
        }
    }
};

interface Config {
    minLogLevel: number | undefined;
}

export const parseConfigFromArgs = (args: string[]): Config => {
    if (args.includes("--help")) {
        printHelpMessage();
        process.exit(0);
    }

    const argument0 = args[0];
    const minLogLevel = parseMinLogLevel(argument0);

    return {
        minLogLevel,
    };
};
