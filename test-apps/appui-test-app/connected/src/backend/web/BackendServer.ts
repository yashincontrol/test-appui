/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Logger } from "@itwin/core-bentley";
import { IModelJsExpressServer } from "@itwin/express-server";
import { IModelHost, IModelHostOptions } from "@itwin/core-backend";
import { BentleyCloudRpcManager } from "@itwin/core-common";
import { getSupportedRpcs } from "../../common/rpcs";
import { loggerCategory } from "../../common/TestAppConfiguration";

/**
 * Initializes Web Server backend
 */
export async function initializeWeb(opts?: IModelHostOptions) {
  // tell BentleyCloudRpcManager which RPC interfaces to handle
  const rpcConfig = BentleyCloudRpcManager.initializeImpl({ info: { title: "appui-test-app", version: "v1.0" } }, getSupportedRpcs());

  // create a basic express web server
  const port = Number(process.env.PORT || 3001);
  const server = new IModelJsExpressServer(rpcConfig.protocol);
  await server.initialize(port);
  Logger.logInfo(loggerCategory, `Web backend for appui-test-app listening on port ${port}`);
  await IModelHost.startup(opts);
}

