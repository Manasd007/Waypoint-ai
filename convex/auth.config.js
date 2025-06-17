export default {
  providers: [
    {
      domain: "https://sweeping-bream-70.clerk.accounts.dev", // your Clerk domain
      applicationID: "convex", // must match the "aud" claim in your JWT
      jwksUrl: "https://sweeping-bream-70.clerk.accounts.dev/.well-known/jwks.json",
      tokenFormat: "jwt",
      tokenIssuer: "https://sweeping-bream-70.clerk.accounts.dev"
    }
  ]
};