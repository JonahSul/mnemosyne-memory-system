import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { AgentRole, FederationAuth, ROLE_CAPABILITIES, type FederationIdentity } from '../src/modules/federation-auth.js';

describe('FederationAuth', () => {
	let auth: FederationAuth;
	let identity: FederationIdentity;
	let privateKey: CryptoKey;

	beforeEach(async () => {
		auth = new FederationAuth();

		const { publicKey, privateKey: signingKey } = await generateKeyPair('EdDSA');
		privateKey = signingKey;
		const jwk = await exportJWK(publicKey);
		if (!jwk.x) {
			throw new Error('Generated key missing JWK x coordinate');
		}

		identity = {
			agentId: 'did:key:test-agent',
			clusterRole: AgentRole.AGENT,
			clusterId: 'cluster-alpha-001',
			publicKey: jwk.x,
			capabilities: [...ROLE_CAPABILITIES[AgentRole.AGENT]],
			reputation: 0.9,
			isActive: true,
			lastSeen: new Date().toISOString()
		};

		auth.registerIdentity(identity);
	});

	it('accepts a valid Ed25519-signed token', async () => {
		const token = await new SignJWT({
			role: identity.clusterRole,
			cluster_id: identity.clusterId,
			capabilities: identity.capabilities
		})
			.setProtectedHeader({ alg: 'EdDSA' })
			.setIssuedAt()
			.setExpirationTime('1h')
			.setSubject(identity.agentId)
			.setJti('session-valid-1')
			.sign(privateKey);

		const session = await auth.validateToken(token);
		expect(session).not.toBeNull();
		expect(session?.sessionId).toBe('session-valid-1');
		expect(session?.identity.agentId).toBe(identity.agentId);
		expect(session?.identity.lastSeen).not.toBe(identity.lastSeen);
	});

	it('rejects tokens signed with an unknown key', async () => {
		const { privateKey: otherKey } = await generateKeyPair('EdDSA');
		const forgedToken = await new SignJWT({
			role: identity.clusterRole,
			cluster_id: identity.clusterId,
			capabilities: identity.capabilities
		})
			.setProtectedHeader({ alg: 'EdDSA' })
			.setIssuedAt()
			.setExpirationTime('1h')
			.setSubject(identity.agentId)
			.setJti('session-forged')
			.sign(otherKey);

		const result = await auth.validateToken(forgedToken);
		expect(result).toBeNull();
	});

	it('rejects tokens that claim unauthorized roles', async () => {
		const token = await new SignJWT({
			role: AgentRole.ARBITER,
			cluster_id: identity.clusterId
		})
			.setProtectedHeader({ alg: 'EdDSA' })
			.setIssuedAt()
			.setExpirationTime('1h')
			.setSubject(identity.agentId)
			.setJti('session-role-mismatch')
			.sign(privateKey);

		const result = await auth.validateToken(token);
		expect(result).toBeNull();
	});
});
