/**
 * Easypanel Domain Management
 * 
 * Easypanel doesn't have a public API for domain management.
 * Instead, we use a wildcard domain approach:
 * 
 * 1. Setup wildcard domain in Easypanel: *.repodocs.dev
 * 2. All subdomains automatically work: project.repodocs.dev
 * 3. For custom domains (docs.example.com), user must:
 *    - Add CNAME pointing to repodocs.dev
 *    - Manually add domain in Easypanel (one-time setup)
 * 
 * This module provides helper functions and status checking.
 */

interface EasypanelConfig {
  url: string;
  token: string;
  project: string;
  service: string;
}

interface EasypanelResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Get Easypanel configuration from environment
 */
function getConfig(): EasypanelConfig | null {
  const url = process.env.EASYPANEL_URL;
  const token = process.env.EASYPANEL_TOKEN;
  const project = process.env.EASYPANEL_PROJECT || 'repodocs';
  const service = process.env.EASYPANEL_SERVICE || 'app';

  if (!url || !token) {
    return null;
  }

  return { url, token, project, service };
}

/**
 * Check if Easypanel integration is enabled
 */
export function isEasypanelEnabled(): boolean {
  return !!getConfig();
}

/**
 * Add a domain to Easypanel
 * 
 * Note: Easypanel doesn't have a public API for this.
 * This function attempts to use internal tRPC endpoints.
 * If it fails, the domain must be added manually.
 */
export async function addDomainToEasypanel(domain: string): Promise<EasypanelResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured. Set EASYPANEL_URL and EASYPANEL_TOKEN.' 
    };
  }

  // Try multiple endpoint formats
  const endpoints = [
    {
      url: `${config.url}/api/trpc/services.addDomain`,
      body: { json: { projectName: config.project, serviceName: config.service, domain } }
    },
    {
      url: `${config.url}/api/trpc/app.addDomain`,
      body: { json: { projectName: config.project, serviceName: config.service, domain } }
    },
    {
      url: `${config.url}/api/trpc/domain.create`,
      body: { json: { projectName: config.project, serviceName: config.service, host: domain, https: true } }
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`,
        },
        body: JSON.stringify(endpoint.body),
      });

      if (response.ok) {
        return { 
          success: true, 
          message: `Domain ${domain} added to Easypanel` 
        };
      }
    } catch (error) {
      // Try next endpoint
      continue;
    }
  }

  // If all endpoints fail, return instructions for manual setup
  return { 
    success: false, 
    error: 'Automatic domain setup failed. Please add the domain manually in Easypanel.',
    message: `Manual setup required: Go to Easypanel > ${config.project} > ${config.service} > Domains > Add Domain: ${domain}`
  };
}

/**
 * Remove a domain from Easypanel
 */
export async function removeDomainFromEasypanel(domain: string): Promise<EasypanelResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured' 
    };
  }

  const endpoints = [
    {
      url: `${config.url}/api/trpc/services.removeDomain`,
      body: { json: { projectName: config.project, serviceName: config.service, domain } }
    },
    {
      url: `${config.url}/api/trpc/app.removeDomain`,
      body: { json: { projectName: config.project, serviceName: config.service, domain } }
    },
    {
      url: `${config.url}/api/trpc/domain.delete`,
      body: { json: { projectName: config.project, serviceName: config.service, host: domain } }
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`,
        },
        body: JSON.stringify(endpoint.body),
      });

      if (response.ok) {
        return { 
          success: true, 
          message: `Domain ${domain} removed from Easypanel` 
        };
      }
    } catch (error) {
      continue;
    }
  }

  return { 
    success: false, 
    error: 'Automatic domain removal failed. Please remove the domain manually in Easypanel.' 
  };
}

/**
 * List domains in Easypanel
 */
export async function listEasypanelDomains(): Promise<EasypanelResult & { domains?: string[] }> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured' 
    };
  }

  const endpoints = [
    `${config.url}/api/trpc/services.getDomains?input=${encodeURIComponent(JSON.stringify({ json: { projectName: config.project, serviceName: config.service } }))}`,
    `${config.url}/api/trpc/app.getDomains?input=${encodeURIComponent(JSON.stringify({ json: { projectName: config.project, serviceName: config.service } }))}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const domains = data.result?.data?.json || [];
        return { success: true, domains };
      }
    } catch (error) {
      continue;
    }
  }

  return { 
    success: false, 
    error: 'Could not fetch domains from Easypanel' 
  };
}

/**
 * Test Easypanel connection
 */
export async function testEasypanelConnection(): Promise<EasypanelResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured. Set EASYPANEL_URL and EASYPANEL_TOKEN.' 
    };
  }

  try {
    // Try to fetch service info
    const response = await fetch(`${config.url}/api/trpc/projects.getAll`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    });

    if (response.ok) {
      return { success: true, message: 'Connected to Easypanel' };
    }

    // Try alternative endpoint
    const altResponse = await fetch(`${config.url}/api/trpc/user.me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    });

    if (altResponse.ok) {
      return { success: true, message: 'Connected to Easypanel' };
    }

    return { 
      success: false, 
      error: `Easypanel API returned ${response.status}` 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

/**
 * Get instructions for manual domain setup
 */
export function getManualSetupInstructions(domain: string): string {
  const config = getConfig();
  const project = config?.project || 'repodocs';
  const service = config?.service || 'app';
  
  return `
To add ${domain} to Easypanel:

1. Go to Easypanel Dashboard
2. Navigate to: ${project} > ${service} > Domains
3. Click "Add Domain"
4. Enter: ${domain}
5. Enable HTTPS (Let's Encrypt)
6. Click "Add"

DNS Configuration:
- Add a CNAME record: ${domain} → repodocs.dev
- Or add an A record pointing to your server IP
`;
}

export const easypanel = {
  addDomain: addDomainToEasypanel,
  removeDomain: removeDomainFromEasypanel,
  listDomains: listEasypanelDomains,
  testConnection: testEasypanelConnection,
  isEnabled: isEasypanelEnabled,
  getManualSetupInstructions,
};
