-- Fixed official-source registry. Automation remains in shadow mode and never
-- publishes evidence or trends without owner review.

insert into public.source_registry (
  source_key,
  country_code,
  publisher,
  base_url,
  allowed_hosts,
  source_kind,
  schedule_cron,
  health,
  automation_enabled,
  shadow_started_at,
  parser_version
)
values
  (
    'sg_csa', 'SG', 'Cyber Security Agency of Singapore',
    'https://www.csa.gov.sg/resources/publications/',
    array['www.csa.gov.sg', 'csa.gov.sg'], 'html', '0 */4 * * *',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'my_mycert', 'MY', 'Malaysia Computer Emergency Response Team',
    'https://mycert.org.my/portal/advisories',
    array['mycert.org.my', 'www.mycert.org.my'], 'html', '15 */4 * * *',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'my_csm_mirror', 'MY', 'CyberSecurity Malaysia',
    'https://www.cybersecurity.my/portal-main/advisories',
    array['www.cybersecurity.my', 'cybersecurity.my'], 'html', '30 */12 * * *',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'my_nacsa', 'MY', 'National Cyber Security Agency Malaysia',
    'https://www.nacsa.gov.my/alert.php',
    array['www.nacsa.gov.my', 'nacsa.gov.my'], 'html', '45 */6 * * *',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'id_idsirtii', 'ID', 'Indonesia Security Incident Response Team on Internet Infrastructure',
    'https://www.idsirtii.or.id/peringatan.html',
    array['www.idsirtii.or.id', 'idsirtii.or.id'], 'html', '20 */6 * * *',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'id_bssn_publications', 'ID', 'Badan Siber dan Sandi Negara',
    'https://gate.bssn.go.id/ppid-document/Informasi-serta-merta/lanskap-keamanan-siber-indonesia',
    array['gate.bssn.go.id', 'www.bssn.go.id', 'bssn.go.id'], 'html', '0 2 * * 1',
    'shadow', false, now(), 'metadata-probe-v1'
  ),
  (
    'id_manual_official', 'ID', 'Indonesian government and financial regulators',
    'https://www.komdigi.go.id/',
    array['www.komdigi.go.id', 'komdigi.go.id', 'jdih.komdigi.go.id', 'www.ojk.go.id', 'ojk.go.id'],
    'manual', null, 'shadow', false, now(), 'metadata-probe-v1'
  )
on conflict (source_key) do update
set
  publisher = excluded.publisher,
  base_url = excluded.base_url,
  allowed_hosts = excluded.allowed_hosts,
  source_kind = excluded.source_kind,
  schedule_cron = excluded.schedule_cron,
  parser_version = excluded.parser_version;
