import { toHex } from 'viem';

// Standardized Base Builder attribution and generic app attribution codes
const BUILDER_CODE = 'bc_w0pxg1t1';
const ATTRIBUTION_CODE = 'LOOOP_APP_v1';

/**
 * Encodes attribution data for an on-chain transaction based on ERC-8021 principles.
 * This appends specific calldata markers to identify the builder and the app.
 *
 * @param eventData - Additional hex or string data string to attach (e.g. score or metadata).
 * @param originalCalldata - The original functional calldata. If none, pass empty string or '0x'.
 * @returns Built hex string ready to be attached to a transaction `data` field.
 */
export function encodeAttributionData(eventData: string = '', originalCalldata: `0x${string}` = '0x'): `0x${string}` {
  const payload = `ATTRIB:${ATTRIBUTION_CODE};BUILDER:${BUILDER_CODE};EVENT:${eventData}`;
  const attributionHex = toHex(payload);
  
  if (!originalCalldata || originalCalldata === '0x') {
    return attributionHex;
  }
  
  const cleanOriginal = originalCalldata.startsWith('0x') ? originalCalldata.slice(2) : originalCalldata;
  const cleanAttribution = attributionHex.replace('0x', '');
  
  return `0x${cleanOriginal}${cleanAttribution}` as `0x${string}`;
}
