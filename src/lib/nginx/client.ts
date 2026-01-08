/**
 * Nginx Client
 * 
 * Handles automatic Nginx configuration and SSL certificate management
 * for custom domains using Let's Encrypt and Certbot
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NginxResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Check if Nginx automation is enabled
 */
export function isNginxEnabled(): boolean {
  return process.env.NGINX_ENABLED === 'true';
}

/**
 * Get Nginx configuration
 */
function getNginxConfig(): {
  enabled: boolean;
  mainDomain: string;
  certbotEmail: string;
  sslPath: string;
  configPath: string;
} {
  return {
    enabled: isNginxEnabled(),
    mainDomain: process.env.NGINX_MAIN_DOMAIN || 'yourdomain.com',
    certbotEmail: process.env.CERTBOT_EMAIL || 'admin@yourdomain.com',
    sslPath: process.env.NGINX_SSL_PATH || '/etc/letsencrypt/live',
    configPath: process.env.NGINX_CONFIG_PATH || '/etc/nginx/sites-available',
  };
}

/**
 * Add a custom domain with SSL certificate
 * 
 * This function:
 * 1. Creates SSL certificate using Certbot (if not exists)
 * 2. Reloads Nginx configuration
 */
export async function addDomain(domain: string): Promise<NginxResult> {
  if (!isNginxEnabled()) {
    return { success: true, message: 'Nginx automation disabled' };
  }

  try {
    const config = getNginxConfig();
    
    // Validate domain format
    if (!isValidDomain(domain)) {
      return { success: false, error: 'Invalid domain format' };
    }

    // Check if domain is already configured
    const certExists = await certificateExists(domain, config);
    
    if (!certExists) {
      // Create SSL certificate using Certbot
      const certResult = await createCertificate(domain, config);
      if (!certResult.success) {
        return certResult;
      }
    }

    // Reload Nginx to apply changes
    const reloadResult = await reloadNginx();
    if (!reloadResult.success) {
      return reloadResult;
    }

    return { 
      success: true, 
      message: `Domain ${domain} configured successfully` 
    };
  } catch (error) {
    console.error('Nginx add domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Remove a custom domain
 */
export async function removeDomain(domain: string): Promise<NginxResult> {
  if (!isNginxEnabled()) {
    return { success: true, message: 'Nginx automation disabled' };
  }

  try {
    // Reload Nginx to apply changes
    const reloadResult = await reloadNginx();
    if (!reloadResult.success) {
      return reloadResult;
    }

    return { 
      success: true, 
      message: `Domain ${domain} removed successfully` 
    };
  } catch (error) {
    console.error('Nginx remove domain error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if SSL certificate exists for domain
 */
async function certificateExists(
  domain: string, 
  config: ReturnType<typeof getNginxConfig>
): Promise<boolean> {
  try {
    const { stdout } = await execAsync('sudo certbot certificates');
    return stdout.includes(domain);
  } catch {
    return false;
  }
}

/**
 * Create SSL certificate using Certbot
 */
async function createCertificate(
  domain: string,
  config: ReturnType<typeof getNginxConfig>
): Promise<NginxResult> {
  try {
    // Use DNS validation for wildcard domains
    const isWildcard = domain.startsWith('*.');
    const challenge = isWildcard ? 'dns' : 'http';
    
    const command = `sudo certbot certonly --${challenge} --non-interactive --agree-tos -m ${config.certbotEmail} -d ${domain}`;
    
    await execAsync(command);
    
    return { 
      success: true, 
      message: `SSL certificate created for ${domain}` 
    };
  } catch (error) {
    console.error('Certbot error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create certificate' 
    };
  }
}

/**
 * Reload Nginx configuration
 */
async function reloadNginx(): Promise<NginxResult> {
  try {
    // Test configuration first
    await execAsync('sudo nginx -t');
    
    // Reload Nginx
    await execAsync('sudo systemctl reload nginx');
    
    return { 
      success: true, 
      message: 'Nginx reloaded successfully' 
    };
  } catch (error) {
    console.error('Nginx reload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reload Nginx' 
    };
  }
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  // Remove wildcard if present
  const cleanDomain = domain.replace(/^\*\./, '');
  
  // Basic domain validation
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(cleanDomain);
}

/**
 * Get certificate info
 */
export async function getCertificateInfo(domain: string): Promise<NginxResult & { info?: string }> {
  if (!isNginxEnabled()) {
    return { success: true, message: 'Nginx automation disabled' };
  }

  try {
    const { stdout } = await execAsync(`sudo certbot certificates | grep -A 5 "${domain}"`);
    return { 
      success: true, 
      info: stdout 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Certificate not found' 
    };
  }
}

export const nginx = {
  addDomain,
  removeDomain,
  getCertificateInfo,
  isEnabled: isNginxEnabled,
};
