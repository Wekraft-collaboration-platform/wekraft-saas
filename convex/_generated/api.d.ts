/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as agentTools from "../agentTools.js";
import type * as apiKeys from "../apiKeys.js";
import type * as calendar from "../calendar.js";
import type * as crons from "../crons.js";
import type * as customerDesk from "../customerDesk.js";
import type * as extensionApi from "../extensionApi.js";
import type * as http from "../http.js";
import type * as issue from "../issue.js";
import type * as lemonsqueezy from "../lemonsqueezy.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as pricing from "../pricing.js";
import type * as project from "../project.js";
import type * as projectDetails from "../projectDetails.js";
import type * as razorpay from "../razorpay.js";
import type * as repo from "../repo.js";
import type * as scheduleRunner from "../scheduleRunner.js";
import type * as scheduler from "../scheduler.js";
import type * as sprint from "../sprint.js";
import type * as support from "../support.js";
import type * as teamspaceAgents from "../teamspaceAgents.js";
import type * as user from "../user.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  agentTools: typeof agentTools;
  apiKeys: typeof apiKeys;
  calendar: typeof calendar;
  crons: typeof crons;
  customerDesk: typeof customerDesk;
  extensionApi: typeof extensionApi;
  http: typeof http;
  issue: typeof issue;
  lemonsqueezy: typeof lemonsqueezy;
  notifications: typeof notifications;
  payments: typeof payments;
  pricing: typeof pricing;
  project: typeof project;
  projectDetails: typeof projectDetails;
  razorpay: typeof razorpay;
  repo: typeof repo;
  scheduleRunner: typeof scheduleRunner;
  scheduler: typeof scheduler;
  sprint: typeof sprint;
  support: typeof support;
  teamspaceAgents: typeof teamspaceAgents;
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
