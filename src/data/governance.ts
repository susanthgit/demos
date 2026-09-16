export const sources = {
  privacy: { label: 'Copilot privacy', url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy' },
  rcd: { label: 'Restricted content discovery', url: 'https://learn.microsoft.com/en-us/sharepoint/restricted-content-discovery' },
  rac: { label: 'Restricted access control', url: 'https://learn.microsoft.com/en-us/sharepoint/restricted-access-control' },
  reports: { label: 'Data access governance', url: 'https://learn.microsoft.com/en-us/sharepoint/data-access-governance-reports' },
  sam: { label: 'SAM licensing', url: 'https://learn.microsoft.com/en-us/sharepoint/sharepoint-advanced-management-features-copilot-license' },
  labels: { label: 'Purview protections', url: 'https://learn.microsoft.com/en-us/purview/ai-m365-copilot-considerations' },
  dlp: { label: 'Copilot DLP', url: 'https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about' },
  engine: { label: 'Custom-engine agents', url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-custom-engine-agent' },
  tools: { label: 'Agent tools and credentials', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent' },
  policy: { label: 'Power Platform data policies', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention' },
  audit: { label: 'Audit Copilot', url: 'https://learn.microsoft.com/en-us/purview/audit-copilot' },
  retention: { label: 'Audit retention', url: 'https://learn.microsoft.com/en-us/purview/audit-log-retention-policies' },
  dspm: { label: 'DSPM permissions', url: 'https://learn.microsoft.com/en-us/purview/data-security-posture-management-permissions' },
  export: { label: 'Authorised interaction export', url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/interaction-export/aiinteractionhistory-getallenterpriseinteractions' },
  articleAudit: { label: 'Auditing Copilot', url: 'https://www.aguidetocloud.com/blog/auditing-microsoft-365-copilot/' },
  articleSharing: { label: 'SharePoint oversharing controls', url: 'https://www.aguidetocloud.com/blog/sharepoint-oversharing-controls-microsoft-365-copilot/' },
  articleAgents: { label: 'Agent data flow and governance', url: 'https://www.aguidetocloud.com/blog/microsoft-365-copilot-agents-data-flow-governance/' },
  articleQuestions: { label: 'Security questions answered', url: 'https://www.aguidetocloud.com/blog/microsoft-365-copilot-security-questions-answered/' },
};

export type GovernanceScene = {
  id: string;
  chapter: string;
  title: string;
  highlight?: string;
  description: string;
  note: string[];
  sources: (typeof sources)[keyof typeof sources][];
};

export const scenes: GovernanceScene[] = [
  {
    id: 'start', chapter: 'Copilot governance, made visible', title: 'What can Copilot actually reach?', highlight: 'actually reach',
    description: 'Start with the source. Follow the permissions, the agent and the evidence.',
    note: [
      'This is Sush’s personal A Guide to Cloud training demo. It uses public documentation and fictional examples. It is neither a live tenant assessment nor a Microsoft guarantee.',
      'This public route is marked noindex to reduce search discovery. That is not an access control.',
      'Start by agreeing the workload, audience and source boundary. Use the experiments to discuss controls, then validate the exact experience in an authorised pilot. Documentation checked for 15 September 2026; service rollout and licensing can vary.',
    ],
    sources: [sources.privacy, sources.articleQuestions],
  },
  {
    id: 'risk', chapter: 'Start with the risk', title: 'Broad access becomes easy discovery.', highlight: 'easy discovery',
    description: 'For user-scoped Microsoft 365 retrieval, broad permissions can make existing data easier to find.',
    note: [
      'Copilot can change the ease and speed of discovering information. Existing permissions are one important boundary, but they do not remove risks from oversharing, untrusted content, inaccurate answers or connected actions.',
      'Choose one buyer question to follow. Return through Chapters if the conversation changes direction. These questions are a scoping aid, not a risk assessment.',
    ],
    sources: [sources.privacy, sources.articleQuestions],
  },
  {
    id: 'request', chapter: 'Follow the request', title: 'The permission check is on the path.', highlight: 'permission check',
    description: 'A simplified view of built-in, user-scoped Microsoft 365 retrieval.',
    note: [
      'This simplified path describes built-in Microsoft 365 Copilot retrieval in the user’s context. It does not claim every agent uses Microsoft Graph, user-delegated identity, or the same orchestration.',
      'Web search, connectors and actions can cross other boundaries. Validate each configured service and identity. Audit records depend on the host and supported activity; do not promise visibility into every tool invocation.',
    ],
    sources: [sources.privacy, sources.audit],
  },
  {
    id: 'permissions', chapter: 'Try the access model', title: 'Check the file AND the group.', highlight: 'AND',
    description: 'RAC adds a group gate. It does not grant a missing source permission.',
    note: [
      'Illustrative model, not a tenant test. For this simplified SharePoint RAC example: eligible direct access = existing source permission AND (RAC disabled OR membership of an allowed RAC group).',
      'This tests eligibility for direct source access, not retrieval ranking or a guarantee that Copilot will find, cite or use the file. Existing downloads and copies are not revoked. Propagation, group type and site-specific exceptions must be tested separately.',
    ],
    sources: [sources.rac],
  },
  {
    id: 'discover', chapter: 'Find the review queue', title: 'Start with the sites that need a look.', highlight: 'need a look',
    description: 'Use SharePoint Advanced Management to prioritise an owner-led review.',
    note: [
      'All three sites and findings shown here are fictional. EEEU means Everyone except external users. Broad sharing links and broken inheritance need context; they are signals for review, not proof that a breach occurred.',
      'Data access governance and permission snapshot reports are asynchronous. Use the available reports, review them with the site owner, right-size access and rerun the relevant checks.',
      'One assigned qualifying Microsoft 365 Copilot licence with the required base licence unlocks the documented included SAM features. It does not include every SAM capability. Check SAM Plan 1 exceptions and the separate E5 requirements for sensitivity-label reports.',
    ],
    sources: [sources.reports, sources.sam],
  },
  {
    id: 'discovery-access', chapter: 'Two controls, two jobs', title: 'Hide discovery? Or restrict access?', highlight: 'restrict access',
    description: 'Look at the setting, then ask which route it controls.',
    note: [
      'RCD limits organisation-wide discovery while owners review a site. Existing permissions remain. Direct access and site-context search are separate from organisation-wide discovery; in-use content is not the same as a source-access block.',
      'The current RCD page conflicts with itself on recently interacted files: its introduction includes them, while a later section says they remain discoverable. Validate current behaviour in the target tenant. Do not promise universal denial for an existing agent.',
      'RAC requires both source permission and membership in an allowed group. Group and search-index propagation take time. Shared and private channel sites need their own configuration; a parent team’s RAC policy is not inherited. External participants in a shared channel are not evaluated against the resource tenant’s RAC policy.',
      'The screenshot is an official Microsoft demonstration reproduced in Sush’s published oversharing article. It is not today’s Caldova tenant or a customer assessment. UI and behaviour may vary by tenant.',
    ],
    sources: [sources.rcd, sources.rac, sources.articleSharing],
  },
  {
    id: 'labels', chapter: 'The label is the starting point', title: '“Confidential” is not the whole answer.', highlight: 'whole answer',
    description: 'Check the container setting, item rights and DLP action separately.',
    note: [
      'Container labels configure a site, group or team. They do not automatically label every item inside. Item labels can carry encryption and usage rights. DLP applies its own configured conditions and actions.',
      'Supported encrypted content needs VIEW and EXTRACT rights for Copilot processing. Rights Management OWNER is a usage right; it is not the same as SharePoint Full Control. Supported in-app experiences and the active Edge page have additional considerations, so test the exact surface.',
    ],
    sources: [sources.labels, sources.dlp],
  },
  {
    id: 'dlp', chapter: 'Be precise about DLP', title: 'What exactly are we blocking?', highlight: 'exactly',
    description: 'Simulation, labelled content and sensitive prompts are different policy questions.',
    note: [
      'This is an explanatory illustration, not a live Purview rule editor or an enforcement test. It does not submit or inspect a prompt.',
      'Simulation observes matches rather than blocking. A label-based Copilot policy can exclude supported content from processing even if the user can open the file; citations can still appear.',
      'Prompt sensitive-information-type blocking is a separate preview capability. That check does not inspect uploaded file contents. A separate web-search-only action can block external web search while allowing a response using permitted internal sources.',
      'Label-based content protection requires eligible Purview E5-equivalent entitlements. Do not apply that blanket licensing claim to the prompt preview. Verify current tenant rollout and licence terms; allow up to four hours for policy changes to take effect.',
    ],
    sources: [sources.dlp, sources.labels],
  },
  {
    id: 'agents', chapter: 'Which agent are we discussing?', title: 'The chat window is only the front door.', highlight: 'front door',
    description: 'Microsoft 365 Copilot can host both approaches. The engine and connected services still matter.',
    note: [
      'Microsoft 365 Copilot can host declarative and custom-engine agents. A channel is where a person interacts; architecture determines how orchestration, models, sources and tools are used.',
      'Copilot Studio and Microsoft Foundry can be used to build custom-engine agents. Do not assume all services connected to an agent inherit the core Microsoft 365 Copilot privacy boundary.',
      'An uploaded file may be a separate copy. Revoking access to the original source does not necessarily remove that copy. Record source locations, copies, retention and destinations before approval.',
    ],
    sources: [sources.engine, sources.articleAgents, sources.privacy],
  },
  {
    id: 'credentials', chapter: 'Follow the authority', title: 'Who owns this connection?', highlight: 'this connection',
    description: 'The person asking and the identity doing the work can differ.',
    note: [
      'A user-delegated connection can act within the signed-in user’s granted scope. A maker-provided connection can use the maker’s configured authority, including during an interactive conversation.',
      'An automated run uses the configured connection for that tool or flow. Do not assume every autonomous action uses one identity, or that maker credentials only apply to autonomous runs.',
      'Review authentication mode, connection owner, permissions, downstream authorisation and data destinations. Approval of an agent’s audience is not proof that each connection is safe.',
    ],
    sources: [sources.tools, sources.articleAgents],
  },
  {
    id: 'lifecycle', chapter: 'Before you publish', title: 'An owner at every gate.', highlight: 'every gate',
    description: 'Keep source access, agent audience and tool connections separate.',
    note: [
      'Power Platform data policies control connector combinations, channels and supported endpoints. They are not a universal sensitive-content classifier. Coverage and enforcement differ by platform and channel.',
      'Agent registries and inventory depend on integration and platform coverage. No finding or a zero risk indicator does not prove that an agent is clean. There is no universal kill switch that automatically contains every channel and downstream connection.',
      'Sharing an agent does not automatically grant every source permission. Agent Builder can optionally grant source access as part of sharing; that separately granted access can persist after agent access is revoked. Review both grants.',
    ],
    sources: [sources.policy, sources.tools, sources.articleAgents],
  },
  {
    id: 'audit', chapter: 'Read the evidence', title: 'An event is not the conversation.', highlight: 'the conversation',
    description: 'Audit can connect the user, host and resources. Full prompt and response text needs a separate route.',
    note: [
      'This field sketch is synthetic, not an exact export schema. The IDs demo-message-01 and demo-resource-01 are invented. No actual account identifiers, IP addresses or event timestamps are included.',
      'CopilotInteraction and associated fields vary by supported host and activity. Message identifiers and resource references help investigations, but not every event includes all fields or every tool call.',
      'Full content review needs a separate authorised path such as supported DSPM experiences, eDiscovery or the interaction export API. Being someone’s manager is not sufficient permission.',
    ],
    sources: [sources.audit, sources.articleAudit],
  },
  {
    id: 'content-evidence', chapter: 'Then read the content', title: 'This is the content view.', highlight: 'content view',
    description: 'Published, redacted August lab evidence. Select a crop to read the prompt, response or files.',
    note: [
      'This is an already-public, redacted August lab capture from Sush’s auditing article, including its original red annotations. It is published demo evidence, not live telemetry or today’s customer tenant.',
      'Supported DSPM content views and eDiscovery require the relevant roles and scoped access. The interaction export API is a separate authorised application route with its own permissions and availability requirements. A manager relationship alone grants none of these.',
      'Copilot audit events have a default 180-day retention period, including for E5 users. Configure custom audit retention where entitled. Conversation/content retention and legal holds are a separate policy plane; audit retention does not preserve the full conversation by itself.',
    ],
    sources: [sources.dspm, sources.export, sources.retention, sources.articleAudit],
  },
  {
    id: 'respond', chapter: 'Respond deliberately', title: 'Contain the path. Keep the evidence.', highlight: 'Keep the evidence',
    description: 'Investigate what happened before deciding what to remove.',
    note: [
      'Use a scoped incident process rather than a purge or delete default. Preserve relevant evidence, identify source access, agent publication and tool connections, then contain the affected paths.',
      'Audit event retention differs from content retention. Retention requirements and holds can preserve content despite user deletion; involve the authorised records and legal teams.',
      'For a fictional policy-retrieval pilot, use the approved version, name a content owner and require human review. This experience provides no clinical advice and must not substitute for clinical judgement.',
    ],
    sources: [sources.audit, sources.retention, sources.articleQuestions],
  },
  {
    id: 'pilot', chapter: 'Make a bounded decision', title: 'What must be true before the pilot?', highlight: 'before the pilot',
    description: 'A discussion checklist. A checked box does not make a tenant ready.',
    note: [
      'This is a discussion checklist, not certification, a risk score or proof of control effectiveness. No information is sent or stored externally. Selections exist only in this page’s memory and clear on reload.',
      'For each gate, agree who owns it and what evidence will be reviewed. Test allowed and denied source access, configured connections, investigation roles and incident handling in the actual target environment.',
      'Confirm feature-specific licensing and service rollout before promising a control. Record the bounded audience, approved sources and a review date outside this demo in the organisation’s approved system.',
    ],
    sources: [sources.sam, sources.dlp, sources.articleQuestions],
  },
  {
    id: 'next', chapter: 'The next conversation', title: 'A small pilot. Evidence we can check.', highlight: 'Evidence',
    description: 'Agree the audience, an owner and a review date.',
    note: [
      'Reference position: 15 September 2026. Public documentation and service rollout can change. Restricted SharePoint Search is not proposed as a new rollout control: new enablement was blocked from 31 July 2026.',
      'The RCD documentation has a current contradiction about recently interacted files. Test the target tenant and exact route. Verify platform, channel, licence and role coverage rather than treating the controls in this guide as universal guarantees.',
      'Personal A Guide to Cloud training material, assembled from public sources and fictional examples. No confidential customer content, live tenant connection, customer-data collection or added telemetry.',
    ],
    sources: [sources.articleAudit, sources.articleSharing, sources.articleAgents, sources.articleQuestions],
  },
];
