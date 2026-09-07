import {
  auth,
  OAuthClientProvider,
  OAuthDiscoveryState,
} from "@modelcontextprotocol/sdk/client/auth.js";
import {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

interface SessionStore {
  codeVerifier?: string;
  discoveryState?: OAuthDiscoveryState;
  clientInfo?: OAuthClientInformationMixed;
  tokens?: OAuthTokens;
  authRedirectUrl?: string;
}

// In-memory / temporary session cache for OAuth handshakes
const sessionCache = new Map<string, SessionStore>();

export class DynamicMCPOAuthProvider implements OAuthClientProvider {
  private sessionId: string;
  public redirectUrl: string;
  public clientMetadata: OAuthClientMetadata;

  constructor(sessionId: string, redirectUrl: string) {
    this.sessionId = sessionId;
    this.redirectUrl = redirectUrl;
    this.clientMetadata = {
      client_name: "Wekraft AI Agent Platform",
      redirect_uris: [redirectUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  }

  private get session(): SessionStore {
    if (!sessionCache.has(this.sessionId)) {
      sessionCache.set(this.sessionId, {});
    }
    return sessionCache.get(this.sessionId)!;
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    return this.session.clientInfo;
  }

  async saveClientInformation(clientInformation: OAuthClientInformationMixed): Promise<void> {
    this.session.clientInfo = clientInformation;
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return this.session.tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this.session.tokens = tokens;
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    this.session.codeVerifier = codeVerifier;
  }

  async codeVerifier(): Promise<string> {
    return this.session.codeVerifier || "";
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    this.session.authRedirectUrl = authorizationUrl.toString();
  }

  async saveDiscoveryState(state: OAuthDiscoveryState): Promise<void> {
    this.session.discoveryState = state;
  }

  async discoveryState(): Promise<OAuthDiscoveryState | undefined> {
    return this.session.discoveryState;
  }

  getAuthRedirectUrl(): string | undefined {
    return this.session.authRedirectUrl;
  }

  cleanup() {
    sessionCache.delete(this.sessionId);
  }
}

/**
 * Initiates Dynamic MCP OAuth Flow with any remote MCP server URL (Linear, Notion, Sentry, etc.)
 */
export async function initiateMCPOAuth(
  serverUrl: string,
  sessionId: string,
  redirectUrl: string
): Promise<string> {
  const provider = new DynamicMCPOAuthProvider(sessionId, redirectUrl);

  const result = await auth(provider, {
    serverUrl,
  });

  const authUrl = provider.getAuthRedirectUrl();
  if (!authUrl) {
    throw new Error(`Failed to generate authorization URL for ${serverUrl}`);
  }

  return authUrl;
}

/**
 * Completes Dynamic MCP OAuth Flow and returns the exchanged access token
 */
export async function completeMCPOAuth(
  serverUrl: string,
  sessionId: string,
  redirectUrl: string,
  authorizationCode: string
): Promise<OAuthTokens> {
  const provider = new DynamicMCPOAuthProvider(sessionId, redirectUrl);

  const result = await auth(provider, {
    serverUrl,
    authorizationCode,
  });

  const tokens = await provider.tokens();
  if (!tokens || !tokens.access_token) {
    throw new Error(`Failed to obtain tokens from ${serverUrl}`);
  }

  provider.cleanup();
  return tokens;
}
