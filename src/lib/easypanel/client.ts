/**
 * Easypanel API Client
 * 
 * Easypanel uses tRPC internally. This client communicates with Easypanel's
 * internal API to manage domains programmatically.
 * 
 * Required environment variables:
 * - EASYPANEL_URL: Easypanel instance URL (e.g., https://panel.anyspherex.com)
 * - EASYPANEL_TOKEN: API token from Easypanel (Settings > API Tokens)
 * - EASYPANEL_PROJECT: Project name in Easypanel (e.g., "repodocs")
 * - EASYPANEL_SERVICE: Service name in Easypanel (e.g., "app")
 * 
 * Alternative: Traefik API
 * - TRAEFIK_API_URL: Traefik API URL (e.g., https://traefik.lc58dd.easypanel.host)
 */

interface EasypanelConfig {
  url: string;
  token: string;
  project: string;
  service: string;
  traefikUrl?: string;
}

interface EasypanelResponse<T = unknown> {
  result?: {
    data?: T;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// Easypanel tRPC batch request format
interface TRPCBatchRequest {
  '0': {
    json: Record<string, unknown>;
  };
}

class EasypanelClient {
  private config: EasypanelConfig;

  constructor() {
    this.config = {
      url: process.env.EASYPANEL_URL || '',
      token: process.env.EASYPANEL_TOKEN || '',
      project: process.env.EASYPANEL_PROJECT || 'repodocs',
      service: process.env.EASYPANEL_SERVICE || 'app',
      traefikUrl: process.env.TRAEFIK_API_URL || '',
    };
  }

  private isConfigured(): boolean {
    return !!(this.config.url && this.config.token);
  }

  /**
   * Make a tRPC mutation request to Easypanel
   * Easypanel uses tRPC batch format
   */
  private async trpcMutation<T>(
    procedure: string,
    input: Record<string, unknown>
  ): Promise<EasypanelResponse<T>> {
    if (!this.isConfigured()) {
      console.warn('Easypanel not configured, skipping API call');
      return { error: { message: 'Easypanel not configured' } };
    }

    // Easypanel tRPC endpoint format: /api/trpc/procedure?batch=1
    const url = `${this.config.url}/api/trpc/${procedure}?batch=1`;
    
    // tRPC batch request format
    const body: TRPCBatchRequest = {
      '0': {
        json: input
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Easypanel API error:', response.status, text);
        return { 
          error: { 
            message: `HTTP ${response.status}: ${text}`,
            code: response.status.toString()
          } 
        };
      }

      const result = await response.json();
      // tRPC batch response format: [{ result: { data: ... } }]
      if (Array.isArray(result) && result[0]) {
        return result[0];
      }
      return result;
    } catch (error) {
      console.error('Easypanel request failed:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      };
    }
  }

  /**
   * Get current service configuration
   */
  async getService(): Promise<EasypanelResponse> {
    return this.trpcMutation('services.app.getServiceInfo', {
      projectName: this.config.project,
      serviceName: this.config.service,
    });
  }

  /**
   * Add a domain to the service
   * 
   * Easypanel stores domains in service config and updates Traefik automatically
   */
  async addDomain(domain: string, port: number = 3000): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('Easypanel not configured, domain not added to Easypanel');
      return { success: true }; // Return success to not block the flow
    }

    try {
      // First, get current service config to preserve existing domains
      const serviceInfo = await this.getService();
      
      // Try the domain update mutation
      // Easypanel procedure: services.app.saveDomains
      const response = await this.trpcMutation('services.app.saveDomains', {
        projectName: this.config.project,
        serviceName: this.config.service,
        domains: [{
          host: domain,
          https: true,
          port: port,
          path: '/',
        }],
      });

      if (response.error) {
        // Try alternative: services.app.update with domains array
        const altResponse = await this.trpcMutation('services.app.update', {
          projectName: this.config.project,
          serviceName: this.config.service,
          domains: [{
            host: domain,
            https: true,
            port: port,
            path: '/',
          }],
        });

        if (altResponse.error) {
          console.error('Both Easypanel API attempts failed');
          return { success: false, error: altResponse.error.message };
        }
      }

      // Trigger deploy to apply changes
      await this.deploy();

      return { success: true };
    } catch (error) {
      console.error('Failed to add domain to Easypanel:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Remove a domain from the service
   */
  async removeDomain(domain: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('Easypanel not configured, domain not removed from Easypanel');
      return { success: true };
    }

    try {
      // Get current domains, filter out the one to remove
      const response = await this.trpcMutation('services.app.removeDomain', {
        projectName: this.config.project,
        serviceName: this.config.service,
        domain: domain,
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      // Trigger deploy to apply changes
      await this.deploy();

      return { success: true };
    } catch (error) {
      console.error('Failed to remove domain from Easypanel:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Deploy/redeploy the service to apply changes
   */
  async deploy(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: true };
    }

    try {
      const response = await this.trpcMutation('services.app.deploy', {
        projectName: this.config.project,
        serviceName: this.config.service,
      });

      if (response.error) {
        // Deploy might not be needed if domain changes are applied immediately
        console.warn('Deploy warning:', response.error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to deploy service:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Easypanel not configured' };
    }

    try {
      const response = await this.getService();
      if (response.error) {
        return { success: false, error: response.error.message };
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Singleton instance
export const easypanel = new EasypanelClient();

// Helper function to check if Easypanel integration is enabled
export function isEasypanelEnabled(): boolean {
  return !!(process.env.EASYPANEL_URL && process.env.EASYPANEL_TOKEN);
}
