#!/usr/bin/env node
const Parser = require("tap-parser");
const chalk = require("chalk");

const tap = new Parser();
const out = process.stdout;
const cwd = new RegExp(process.cwd() + "/", "g");
const regex = /\(?([^\s:]+):(\d+):(\d+)\)?$/;

let firstTest = true;

process.stdin.pipe(tap);

tap.on("assert", ({ok}) => {
  if (firstTest) {
    out.write("\n");
    firstTest = false;
  }

  if (ok) out.write(chalk.green("✓"));
  else out.write(chalk.red("x"));
});

tap.on("complete", (res) => {
  process.on("exit", (status) => {
    if (status === 1 || !res.ok) process.exit(1);
  });

  // Error details
  if (!res.ok) {
    out.write("\n\n...\n\n");
    res.failures.map(({name, diag}) => {
      const {stack, ...rest} = diag;
      out.write(`${JSON.stringify({test: name, ...rest}, null, 2)}\n\n`);
    });
  } else {
    out.write("\n\n");
  }

  // Test summary
  out.write("---\n\n");

  if (res.plan.skipAll) {
    out.write(chalk.gray("Tests skipped\n\n"));
    return;
  }

  out.write(`${res.count} tests\n`);
  out.write(`${chalk.green(`${res.pass} passed`)}\n`);

  if (res.ok) {
    out.write(chalk.green("\n👌 All tests passed!\n"));
    out.write("\n");
  } else {
    out.write(`${chalk.red(`${res.fail} failed`)}`);
    out.write("\n\n---\n\n");
    out.write(chalk.red("Failed tests:\n\n"))
    res.failures.map((failure) => printFailure(failure));
  }
});

function printFailure({name, diag}) {
  if (!diag || !diag.at || !diag.stack)
    return out.write("\n" + JSON.stringify(diag) + "\n");

  const {file, line, col} = parseDiag(diag);
  out.write(`${chalk.red("  x")} ${name}\n`);
  out.write(chalk.gray(`    file: ${file}, line: ${line}, col: ${col}\n\n`));
}

function parseDiag(diag) {
  const at = diag.at.replace(cwd, "");
  const stack = diag.stack.replace(cwd, "").split("\n");

  let match = at.match(regex);
  while (
    !match ||
    (match[1].match(/^(internal|node_modules)\//) && stack.length)
  )
    match = stack.shift().match(regex);

  return {file: match[1], line: match[2], col: match[3]};
}
