export function ObfuscatedEmail({ email }: { email: string | null }) {
  if (!email) return <>—</>
  if (email === '[email protected]') {
    // Mimic Cloudflare Scrape Shield: visible text is the placeholder; a real scanner
    // must recover the address elsewhere. data-cfemail is a decoy (not decoded here).
    return <a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="7a121f090911">[email&#160;protected]</a>
  }
  return <>{email}</>
}
