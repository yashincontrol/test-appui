/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { logBuildError, logBuildWarning, failBuild, throwAfterTimeout } = require("./utils");

const rushCommonDir = path.join(__dirname, "../../../../common/");

(async () => {
  const commonTempDir = path.join(rushCommonDir, "config/rush");

  // Npm audit will occasionally take minutes to respond - we believe this is just the npm registry being terrible and slow.
  // We don't want this to slow down our builds though - we'd rather fail fast and try again later.  So we'll just timeout after 30 seconds.
  let jsonOut = {};
  try {
    console.time("Audit time");
    jsonOut = await Promise.race([runPnpmAuditAsync(commonTempDir), throwAfterTimeout(180000, "Timed out contacting npm registry.")]);
    console.timeEnd("Audit time");
    console.log();
  } catch (error) {
    // We want to stop failing the build on transient failures and instead fail only on high/critical vulnerabilities.
    logBuildWarning(error);
    process.exit();
  }

  if (jsonOut.error) {
    console.error(jsonOut.error.summary);
    logBuildWarning("Rush audit failed. This may be caused by a problem with the npm audit server.");
  }

  // A list of temporary advisories excluded from the High and Critical list.
  // Warning this should only be used as a temporary measure to avoid build failures
  // for development dependencies only.
  // All security issues should be addressed asap.
  // every entry should look like:
  // "GHSA-xxxx-xxxx-xxxx", // https://github.com/advisories/GHSA-xxxx-xxxx-xxxx pkgName>subDepA>subDepB
  const excludedAdvisories = [
    "GHSA-f8q6-p94x-37v3", // https://github.com/advisories/GHSA-f8q6-p94x-37v3 minimatch ReDoS
    "GHSA-76p3-8jx3-jpfq", // https://github.com/advisories/GHSA-76p3-8jx3-jpfq appui>@bentley/react-scripts>loader-utils
    "GHSA-3rfm-jhwj-7488", // https://github.com/advisories/GHSA-3rfm-jhwj-7488 appui-test-app>@bentley/react-scripts>react-dev-utils>loader-utils
    "GHSA-hhq3-ff78-jv3g", // https://github.com/advisories/GHSA-hhq3-ff78-jv3g appui-test-app>@bentley/react-scripts>react-dev-utils>loader-utils
    "GHSA-9c47-m6qq-7p4h", // https://github.com/advisories/GHSA-9c47-m6qq-7p4h appui-test-app>@bentley/react-scripts>@babel/core>json5 appui-test-providers>@itwin/eslint-plugin>eslint-import-resolver-typescript>tsconfig-paths>json5
    "GHSA-rc47-6667-2j5j", // https://github.com/advisories/GHSA-rc47-6667-2j5j appui-test-app>electron>@electron/get>got>cacheable-request>http-cache-semantics
  ];

  let shouldFailBuild = false;
  for (const action of jsonOut.actions) {
    for (const issue of action.resolves) {
      const advisory = jsonOut.advisories[issue.id];

      // TODO: This path no longer resolves to a specific package in the repo.  Need to figure out the best way to handle it
      const mpath = issue.path; // .replace("@rush-temp", "@bentley");

      const severity = advisory.severity.toUpperCase();
      const message = `${severity} Security Vulnerability: ${advisory.title} in ${advisory.module_name} (from ${mpath}).  See ${advisory.url} for more info.`;

      // For now, we'll only treat CRITICAL and HIGH vulnerabilities as errors in CI builds.
      if (!excludedAdvisories.includes(advisory.github_advisory_id) && (severity === "HIGH" || severity === "CRITICAL")) {
        logBuildError(message);
        shouldFailBuild = true;
      } else if (excludedAdvisories.includes(advisory.github_advisory_id) || severity === "MODERATE") // Only warn on MODERATE severity items
        logBuildWarning(message);
    }
  }

  // For some reason yarn audit can return the json without the vulnerabilities
  if (undefined === jsonOut.metadata.vulnerabilities || shouldFailBuild)
    failBuild();

  process.exit();
})();

function runPnpmAuditAsync(cwd) {
  return new Promise((resolve, reject) => {
    // pnpm audit requires a package.json file so we temporarily create one and
    // then delete it later
    fs.writeFileSync(path.join(rushCommonDir, "config/rush/package.json"), JSON.stringify("{}", null, 2));

    console.log("Running audit");
    const pnpmPath = path.join(rushCommonDir, "temp/pnpm-local/node_modules/.bin/pnpm");
    const child = spawn(pnpmPath, ["audit", "--json"], { cwd, shell: true });

    let stdout = "";
    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.on('error', (data) => {
      fs.unlinkSync(path.join(rushCommonDir, "config/rush/package.json"));
      reject(data)
    });
    child.on('close', () => {
      fs.unlinkSync(path.join(rushCommonDir, "config/rush/package.json"));
      resolve(JSON.parse(stdout.trim()));
    });
  });
}
