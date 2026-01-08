/**
 * Easypanel API Client
 * 
 * Handles automatic domain management via Easypanel API
 * When a user adds a custom domain, it's automatically added to Easypanel
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
 * Add a domain to Easypanel with SSL
 */
export async function addDomainToEasypanel(domain: string): Promise<EasypanelResult> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured. Set EASYPANEL_URL and EASYPANEL_TOKEN.' 
    };
  }

  try {
    // Easypanel tRPC endpoint for adding domains
    const response = await fetch(`${config.url}/api/trpc/app.createServiceDomain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        json: {
          projectName: config.project,
          serviceName: config.service,
          domain: domain,
          https: true,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypanel API error:', response.status, errorText);
      return { 
        success: false, 
        error: `Easypanel API error: ${response.status}` 
      };
    }

    return { 
      success: true, 
      message: `Domain ${domain} added to Easypanel` 
    };
  } catch (error) {
    console.error('Easypanel add domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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

  try {
    const response = await fetch(`${config.url}/api/trpc/app.removeServiceDomain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        json: {
          projectName: config.project,
          serviceName: config.service,
          domain: domain,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypanel API error:', response.status, errorText);
      return { 
        success: false, 
        error: `Easypanel API error: ${response.status}` 
      };
    }

    return { 
      success: true, 
      message: `Domain ${domain} removed from Easypanel` 
    };
  } catch (error) {
    console.error('Easypanel remove domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * List all domains in Easypanel (also used for testing connection)
 */
export async function listEasypanelDomains(): Promise<EasypanelResult & { domains?: string[] }> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'Easypanel not configured' 
    };
  }

  try {
    // Easypanel uses tRPC - correct endpoint format
    const response = await fetch(`${config.url}/api/trpc/app.getServiceDomains?input=${encodeURIComponent(JSON.stringify({
      json: {
        projectName: config.project,
        serviceName: config.service,
      }
    }))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
    });

    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${config.url}/api/projects/${config.project}/services/${config.service}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`,
        },
      });
      
      if (!altResponse.ok) {
        return { 
          success: false, 
          error: `Easypanel API error: ${response.status}` 
        };
      }
      
      const altData = await altResponse.json();
      return { success: true, domains: altData.domains || [] };
    }

    const data = await response.json();
    const domains = data.result?.data?.json || [];

    return { 
      success: true, 
      domains 
    };
  } catch (error) {
    console.error('Easypanel list domains error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export const easypanel = {
  addDomain: addDomainToEasypanel,
  removeDomain: removeDomainFromEasypanel,
  listDomains: listEasypanelDomains,
  isEnabled: isEasypanelEnabled,
  testConnection: async (): Promise<EasypanelResult> => {
    const result = await listEasypanelDomains();
    return { success: result.success, error: result.error };
  },
};
