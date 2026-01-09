/**
 * Dokploy API Client
 * 
 * Handles automatic domain management via Dokploy API
 * Docs: https://docs.dokploy.com/docs/api/reference-domain
 */

interface DokployConfig {
  url: string;
  apiKey: string;
  applicationId: string;
}

interface DokployResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

interface DomainCreateParams {
  host: string;
  port?: number;
  https?: boolean;
  certificateType?: 'letsencrypt' | 'none' | 'custom';
  path?: string;
}

/**
 * Get Dokploy configuration from environment
 */
function getConfig(): DokployConfig | null {
  const url = process.env.DOKPLOY_URL;
  const apiKey = process.env.DOKPLOY_API_KEY;
  const applicationId = process.env.DOKPLOY_APPLICATION_ID;

  if (!url || !apiKey || !applicationId) {
    return null;
  }

  return { url: url.replace(/\/$/, ''), apiKey, applicationId };
}

/**
 * Check if Dokploy integration is enabled
 */
export function isDokployEnabled(): boolean {
  return !!getConfig();
}

/**
 * Add a domain to Dokploy application
 */
export async function addDomain(domain: string, options?: Partial<DomainCreateParams>): Promise<DokployResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Dokploy not configured. Set DOKPLOY_URL, DOKPLOY_API_KEY, and DOKPLOY_APPLICATION_ID.' 
    };
  }

  try {
    const response = await fetch(`${config.url}/api/domain.create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({
        host: domain,
        applicationId: config.applicationId,
        port: options?.port || 3000,
        https: options?.https ?? true,
        certificateType: options?.certificateType || 'letsencrypt',
        path: options?.path || '/',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Domain ${domain} added to Dokploy`,
        data 
      };
    }

    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    return { 
      success: false, 
      error: error.message || `Dokploy API returned ${response.status}` 
    };
  } catch (error) {
    console.error('Dokploy add domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

/**
 * Remove a domain from Dokploy
 */
export async function removeDomain(domainId: string): Promise<DokployResult> {
  const config = getConfig();
  
  if (!config) {
    return { success: false, error: 'Dokploy not configured' };
  }

  try {
    const response = await fetch(`${config.url}/api/domain.delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({ domainId }),
    });

    if (response.ok) {
      return { success: true, message: 'Domain removed from Dokploy' };
    }

    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    return { success: false, error: error.message };
  } catch (error) {
    console.error('Dokploy remove domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

/**
 * Get domains for the application
 */
export async function getDomains(): Promise<DokployResult & { domains?: unknown[] }> {
  const config = getConfig();
  
  if (!config) {
    return { success: false, error: 'Dokploy not configured' };
  }

  try {
    const response = await fetch(
      `${config.url}/api/domain.byApplicationId?applicationId=${config.applicationId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': config.apiKey,
        },
      }
    );

    if (response.ok) {
      const domains = await response.json();
      return { success: true, domains };
    }

    return { success: false, error: `Failed to fetch domains: ${response.status}` };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

/**
 * Find domain by host name
 */
export async function findDomainByHost(host: string): Promise<DokployResult & { domainId?: string }> {
  const result = await getDomains();
  
  if (!result.success || !result.domains) {
    return { success: false, error: result.error };
  }

  const domain = (result.domains as Array<{ host?: string; domainId?: string }>).find((d) => d.host === host);
  
  if (domain?.domainId) {
    return { success: true, domainId: domain.domainId };
  }

  return { success: false, error: 'Domain not found' };
}

/**
 * Remove domain by host name
 */
export async function removeDomainByHost(host: string): Promise<DokployResult> {
  const findResult = await findDomainByHost(host);
  
  if (!findResult.success || !findResult.domainId) {
    return { success: false, error: findResult.error || 'Domain not found' };
  }

  return removeDomain(findResult.domainId);
}

/**
 * Validate domain DNS
 */
export async function validateDomain(domain: string, serverIp?: string): Promise<DokployResult> {
  const config = getConfig();
  
  if (!config) {
    return { success: false, error: 'Dokploy not configured' };
  }

  try {
    const response = await fetch(`${config.url}/api/domain.validateDomain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({ domain, serverIp }),
    });

    if (response.ok) {
      return { success: true, message: 'Domain DNS is valid' };
    }

    const error = await response.json().catch(() => ({ message: 'DNS validation failed' }));
    return { success: false, error: error.message };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

/**
 * Test Dokploy connection
 */
export async function testConnection(): Promise<DokployResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Dokploy not configured. Set DOKPLOY_URL, DOKPLOY_API_KEY, and DOKPLOY_APPLICATION_ID.' 
    };
  }

  try {
    const response = await fetch(
      `${config.url}/api/domain.byApplicationId?applicationId=${config.applicationId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': config.apiKey,
        },
      }
    );

    if (response.ok) {
      return { success: true, message: 'Connected to Dokploy' };
    }

    return { success: false, error: `Connection failed: ${response.status}` };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

export const dokploy = {
  addDomain,
  removeDomain,
  removeDomainByHost,
  getDomains,
  findDomainByHost,
  validateDomain,
  testConnection,
  isEnabled: isDokployEnabled,
};
