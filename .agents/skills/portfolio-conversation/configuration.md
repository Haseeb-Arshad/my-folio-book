# Runtime configuration

Keep the conversation configuration explicit and versionable. The server reads these values only from the environment.

## Required for live replies

- `PORTFOLIO_OPENROUTER_API_KEY`: server-only OpenRouter credential.
- `PORTFOLIO_OPENROUTER_MODEL`: an approved conversational model. The current default is `openai/gpt-4.1-mini`.

## Optional values

- `PORTFOLIO_SITE_URL`: canonical site URL used for the provider request metadata.
- `PORTFOLIO_AGENT_MESSAGE_BRIDGE_URL`: reserved for a future authenticated, user-owned Messages bridge. It is not used unless the bridge contract and consent flow are implemented.

Do not put credentials in Markdown, client code, a prompt, screenshots, or a commit. A deployment is only ready to call live when the server environment is configured, HTTPS is enabled, rate limiting is present, and the provider request has been verified.

