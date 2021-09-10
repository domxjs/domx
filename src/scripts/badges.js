import { readdirSync } from "fs";
import { exec } from "child_process";

/**
 * Runs test coverage and adds badges to the readme.md files
 * for the root project and all packages.
 * Need to add ![Lines](#lines#) to the readme.md files
 * for the script to replace that with the coverage badge.
 */


console.log(">>> badges");
await run("tsc --build");
const dirs = getDirectories("./packages");
const runs = [runTestAndBadges("root", ".")];
runs.push(...dirs.map(async (dir) => {
    const packageDir = `./packages/${dir}`;
    await runTestAndBadges(dir, packageDir);
}));
await Promise.all(runs);
console.log("DONE!");



function getDirectories(source) {
    return readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
}

async function runTestAndBadges(name, packageDir) {
    const coverageDir = `${packageDir}/.coverage`;

    const jestCommand = `jest --coverage --coverage-directory=\"${coverageDir}\" \"${packageDir}\"`;
    await run(`tests for ${name}`, jestCommand);

    const badgesCommand = `istanbul-badges-readme --linesLabel=\"Coverage\" --coverageDir=\"${coverageDir}\" --readmeDir=\"${packageDir}"`;
    const out = await run(`badges for ${name}`, badgesCommand);
}

function run(name, command) {
    command = command || name;
    console.log(`badges running ${name}...`);
    if (name !== command) {
        console.log(command);
    }
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(stderr);
                console.error(`badges FAILED on running ${name}; ERROR: ${err}`);
                reject(error);
            } else {
                // the *entire* stdout and stderr (buffered)
                // console.log(`stdout: ${stdout}`);
                // console.log(`stderr: ${stderr}`);
                console.log(`Finished running ${name}`);
                resolve(stdout);
            }
        });
    });
}
