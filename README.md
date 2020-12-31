# log-filter

_Note: This is experimental software and may not be suitable for production environments!_

This is a tiny utility program for applying filters to structured JSON logs. It is designed to consume output from other programs that produce logs in JSON format, such as the following:

-   Go applications using the [logrus](https://github.com/sirupsen/logrus) library
-   Node.js applications using the [pino](https://github.com/pinojs/pino) library
-   Python applications using the [json-logging-python](https://github.com/bobbui/json-logging-python) library

Note that you may need an intermediary transport middleware if your logs are not
output in the format expected by this utility. Support for flexible filter
expressions is planned for a future release.

The utility runs on Node.js.

## Usage

Run the utility by executing the `index.js` module. Optionally, you can specify command line arguments (see below).

```console
$ node .
```

Use this utility as part of a UNIX-style pipe to filter out log entries produced by another process.

## Command line options

-   `--help` _(Optional)_: Print out instructions for usage.

-   `--min-level` _(Optional)_: Specify minimum level as a command line argument of type integer (see above example). All lines with a `level` entry lower than the specified value will be ignored. Levels without a `level` entry will not be filtered out.

-   `--invalid-json` (`error` | `skip`) _(Optional, defaults to `error`)_: Specify behavior when consuming invalid JSON lines. With `error`, the process exits with a non-zero exit code. With `skip`, the invalid line is silently filtered out and ignored.

-   `--dry-run` _(Optional)_: Displays filter results with colorized output: lines that pass the specified filter rules are displayed in bold green text. Lines that would be filtered out are displayed in gray text. Using this option requires stdout to be a terminal with color support (set the `FORCE_COLOR` environment variable to `1` to always use colored output; see [details](https://github.com/chalk/supports-color/)).

-   `--debug-print-config` _(Optional)_: Print out resolved configuration and exit.

## Development

Run the following command to run a simple automatic test suite:

```console
$ yarn run test
```
