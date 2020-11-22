const helpMessage = `\
Usage:          node index.js [minlevel]
Example usage:  node index.js 30

Options:        --help    Prints this message
`;

const printHelpMessage = () => {
    console.log(helpMessage);
};

module.exports.printHelpMessage = printHelpMessage;
