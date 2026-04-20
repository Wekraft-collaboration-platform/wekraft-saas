/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentTools from "../agentTools.js";
import type * as calendar from "../calendar.js";
import type * as http from "../http.js";
import type * as issue from "../issue.js";
import type * as pricing from "../pricing.js";
import type * as project from "../project.js";
import type * as projectDetails from "../projectDetails.js";
import type * as repo from "../repo.js";
import type * as sprint from "../sprint.js";
import type * as user from "../user.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentTools: typeof agentTools;
  calendar: typeof calendar;
  http: typeof http;
  issue: typeof issue;
  pricing: typeof pricing;
  project: typeof project;
  projectDetails: typeof projectDetails;
  repo: typeof repo;
  sprint: typeof sprint;
  user: typeof user;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
