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
    // Easypanel API endpoint for adding domains
    const response = await fetch(`${config.url}/api/trpc/domain.create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        json: {
          projectName: config.project,
          serviceName: config.service,
          host: domain,
          https: true,
          certificateType: 'letsencrypt',
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypanel API error:', errorText);
      return { 
        success: false, 
        error: `Easypanel API error: ${response.status}` 
      };
    }

    const data = await response.json();
    
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
    const response = await fetch(`${config.url}/api/trpc/domain.delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        json: {
          projectName: config.project,
          serviceName: config.service,
          host: domain,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypanel API error:', errorText);
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
 * List all domains in Easypanel
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
    const response = await fetch(`${config.url}/api/trpc/service.get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        json: {
          projectName: config.project,
          serviceName: config.service,
        }
      }),
    });

    if (!response.ok) {
      return { 
        success: false, 
        error: `Easypanel API error: ${response.status}` 
      };
    }

    const data = await response.json();
    const domains = data.result?.data?.json?.domains?.map((d: any) => d.host) || [];

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
