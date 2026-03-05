<script>
  import { onMount } from 'svelte';

  let activeTab = $state('notifications');

  // ---- Notifications state ----
  let notifs = $state([]);
  let notifTotal = $state(0);
  let notifPage = $state(1);
  let notifPages = $state(1);
  let notifFilter = $state({ type: '', status: '' });
  let notifLoading = $state(true);
  let expandedId = $state(null);
  let selectedIds = $state(new Set());

  // ---- Subscribers state ----
  let subs = $state([]);
  let subTotal = $state(0);
  let subPage = $state(1);
  let subPages = $state(1);
  let subStats = $state({ confirmed: 0, pending: 0, unsubscribed: 0 });
  let subFilter = $state('');
  let subSearch = $state('');
  let subLoading = $state(true);

  async function fetchNotifications() {
    notifLoading = true;
    const params = new URLSearchParams({ page: String(notifPage) });
    if (notifFilter.type) params.set('type', notifFilter.type);
    if (notifFilter.status) params.set('status', notifFilter.status);

    const res = await fetch(`/api/dashboard/notifications?${params}`);
    const data = await res.json();
    notifs = data.items;
    notifTotal = data.total;
    notifPages = data.pages;
    notifLoading = false;
  }

  async function fetchSubscribers() {
    subLoading = true;
    const params = new URLSearchParams({ page: String(subPage) });
    if (subFilter) params.set('status', subFilter);
    if (subSearch) params.set('search', subSearch);

    const res = await fetch(`/api/dashboard/subscribers?${params}`);
    const data = await res.json();
    subs = data.items;
    subTotal = data.total;
    subPages = data.pages;
    subStats = data.stats;
    subLoading = false;
  }

  async function updateNotifStatus(ids, status) {
    await fetch('/api/dashboard/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...ids], status }),
    });
    selectedIds = new Set();
    await fetchNotifications();
  }

  async function removeSubscriber(id) {
    if (!confirm('Remove this subscriber?')) return;
    await fetch('/api/dashboard/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchSubscribers();
  }

  function toggleSelect(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedIds = next;
  }

  function toggleSelectAll() {
    if (selectedIds.size === notifs.length) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(notifs.map((n) => n.id));
    }
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  let searchTimeout;
  function onSearchInput(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      subSearch = e.target.value;
      subPage = 1;
      fetchSubscribers();
    }, 300);
  }

  onMount(() => {
    fetchNotifications();
    fetchSubscribers();
  });
</script>

<div class="dashboard">
  <!-- Tabs -->
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'notifications'}
      onclick={() => { activeTab = 'notifications'; }}
    >
      Notifications
      {#if notifTotal > 0}
        <span class="tab-count">{notifTotal}</span>
      {/if}
    </button>
    <button
      class="tab"
      class:active={activeTab === 'subscribers'}
      onclick={() => { activeTab = 'subscribers'; }}
    >
      Subscribers
      {#if subStats.confirmed > 0}
        <span class="tab-count">{subStats.confirmed}</span>
      {/if}
    </button>
  </div>

  <!-- Notifications Tab -->
  {#if activeTab === 'notifications'}
    <div class="panel">
      <!-- Filters + bulk actions -->
      <div class="toolbar">
        <div class="filters">
          <select
            value={notifFilter.type}
            onchange={(e) => { notifFilter.type = e.target.value; notifPage = 1; fetchNotifications(); }}
          >
            <option value="">All types</option>
            <option value="contact">Contact</option>
            <option value="booking">Booking</option>
          </select>
          <select
            value={notifFilter.status}
            onchange={(e) => { notifFilter.status = e.target.value; notifPage = 1; fetchNotifications(); }}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {#if selectedIds.size > 0}
          <div class="bulk-actions">
            <button class="action-btn" onclick={() => updateNotifStatus(selectedIds, 'read')}>Mark read</button>
            <button class="action-btn" onclick={() => updateNotifStatus(selectedIds, 'archived')}>Archive</button>
          </div>
        {/if}
      </div>

      {#if notifLoading}
        <div class="empty">Loading...</div>
      {:else if notifs.length === 0}
        <div class="empty">No notifications yet.</div>
      {:else}
        <div class="list">
          <!-- Select all -->
          <div class="list-header">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={selectedIds.size === notifs.length && notifs.length > 0}
                onchange={toggleSelectAll}
              />
            </label>
            <span class="list-header-text">{notifTotal} notification{notifTotal !== 1 ? 's' : ''}</span>
          </div>

          {#each notifs as n (n.id)}
            <div class="notif-row" class:unread={n.status === 'new'} class:expanded={expandedId === n.id}>
              <div class="notif-main" onclick={() => { expandedId = expandedId === n.id ? null : n.id; }}>
                <label class="checkbox-label" onclick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(n.id)} onchange={() => toggleSelect(n.id)} />
                </label>
                {#if n.status === 'new'}
                  <span class="unread-dot" aria-label="Unread"></span>
                {/if}
                <span class="notif-badge" data-type={n.type}>{n.type}</span>
                <span class="notif-name">{n.fromName}</span>
                <span class="notif-preview">{n.message ? n.message.slice(0, 60) : n.subject}</span>
                <span class="notif-date">{formatDate(n.createdAt)}</span>
              </div>

              {#if expandedId === n.id}
                <div class="notif-detail">
                  <div class="detail-row">
                    <span class="detail-label">From</span>
                    <span class="detail-value">{n.fromName} &lt;{n.fromEmail}&gt;</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Subject</span>
                    <span class="detail-value">{n.subject}</span>
                  </div>
                  {#if n.message}
                    <div class="detail-row">
                      <span class="detail-label">Message</span>
                      <span class="detail-value detail-message">{n.message}</span>
                    </div>
                  {/if}
                  {#if n.metadata}
                    {@const meta = JSON.parse(n.metadata)}
                    <div class="detail-row">
                      <span class="detail-label">Booking</span>
                      <span class="detail-value">{meta.slot} ({meta.timezone})</span>
                    </div>
                  {/if}
                  <div class="detail-row">
                    <span class="detail-label">Received</span>
                    <span class="detail-value">{formatDate(n.createdAt)} at {formatTime(n.createdAt)}</span>
                  </div>
                  <div class="detail-actions">
                    {#if n.status === 'new'}
                      <button class="action-btn" onclick={() => updateNotifStatus([n.id], 'read')}>Mark read</button>
                    {/if}
                    {#if n.status !== 'archived'}
                      <button class="action-btn" onclick={() => updateNotifStatus([n.id], 'archived')}>Archive</button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if notifPages > 1}
          <div class="pagination">
            <button disabled={notifPage <= 1} onclick={() => { notifPage--; fetchNotifications(); }}>&larr; Prev</button>
            <span class="page-info">{notifPage} / {notifPages}</span>
            <button disabled={notifPage >= notifPages} onclick={() => { notifPage++; fetchNotifications(); }}>Next &rarr;</button>
          </div>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Subscribers Tab -->
  {#if activeTab === 'subscribers'}
    <div class="panel">
      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{subStats.confirmed}</span>
          <span class="stat-label">Confirmed</span>
        </div>
        <div class="stat">
          <span class="stat-value">{subStats.pending}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat">
          <span class="stat-value">{subStats.unsubscribed}</span>
          <span class="stat-label">Unsubscribed</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="toolbar">
        <div class="filters">
          <input
            type="text"
            placeholder="Search by email..."
            class="search-input"
            oninput={onSearchInput}
          />
          <select
            value={subFilter}
            onchange={(e) => { subFilter = e.target.value; subPage = 1; fetchSubscribers(); }}
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {#if subLoading}
        <div class="empty">Loading...</div>
      {:else if subs.length === 0}
        <div class="empty">No subscribers yet.</div>
      {:else}
        <div class="list">
          <div class="list-header">
            <span class="list-header-text">{subTotal} subscriber{subTotal !== 1 ? 's' : ''}</span>
          </div>

          {#each subs as s (s.id)}
            <div class="sub-row">
              <div class="sub-main">
                <span class="sub-status" data-status={s.status}>{s.status}</span>
                <span class="sub-email">{s.email}</span>
                {#if s.firstName}
                  <span class="sub-name">{s.firstName}</span>
                {/if}
                <span class="sub-date">{formatDate(s.subscribedAt)}</span>
                <button class="remove-btn" onclick={() => removeSubscriber(s.id)} title="Remove subscriber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <path d="m18 6-12 12M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>

        {#if subPages > 1}
          <div class="pagination">
            <button disabled={subPage <= 1} onclick={() => { subPage--; fetchSubscribers(); }}>&larr; Prev</button>
            <span class="page-info">{subPage} / {subPages}</span>
            <button disabled={subPage >= subPages} onclick={() => { subPage++; fetchSubscribers(); }}>Next &rarr;</button>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .dashboard {
    font-family: 'DM Sans', sans-serif;
  }

  /* ---- Tabs ---- */
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    margin-bottom: 1.5rem;
  }

  .tab {
    appearance: none;
    background: none;
    border: none;
    padding: 0.75rem 1.25rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
  }

  .tab:hover {
    color: var(--color-text);
  }

  .tab.active {
    color: var(--color-text);
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--color-accent);
  }

  .tab-count {
    font-size: 0.7rem;
    font-weight: 500;
    background: color-mix(in oklab, var(--color-accent) 15%, transparent);
    color: var(--color-accent);
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
  }

  /* ---- Toolbar ---- */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  select,
  .search-input {
    appearance: none;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--color-text);
    outline: none;
    transition: border-color 0.2s;
  }

  select:focus,
  .search-input:focus {
    border-color: var(--color-accent);
  }

  .search-input {
    min-width: 12rem;
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .bulk-actions {
    display: flex;
    gap: 0.375rem;
  }

  .action-btn {
    appearance: none;
    background: color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    border-radius: 6px;
    padding: 0.35rem 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }

  .action-btn:hover {
    color: var(--color-text);
    border-color: var(--color-text-muted);
  }

  /* ---- Stats bar ---- */
  .stats-bar {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem 1.25rem;
    background: color-mix(in oklab, var(--color-text-muted) 5%, transparent);
    border-radius: 10px;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ---- List ---- */
  .list {
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: 10px;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    background: color-mix(in oklab, var(--color-text-muted) 5%, transparent);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .list-header-text {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    letter-spacing: 0.03em;
  }

  .checkbox-label {
    display: inline-flex;
    cursor: pointer;
  }

  .checkbox-label input {
    accent-color: var(--color-accent);
    cursor: pointer;
  }

  /* ---- Notification rows ---- */
  .notif-row {
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .notif-row:last-child {
    border-bottom: none;
  }

  .notif-main {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.7rem 1rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .notif-main:hover {
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
  }

  .notif-row.unread .notif-name {
    color: var(--color-text);
    font-weight: 500;
  }

  .unread-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
    flex-shrink: 0;
  }

  .notif-badge {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .notif-badge[data-type="contact"] {
    background: color-mix(in oklab, var(--color-accent-teal) 15%, transparent);
    color: var(--color-accent-teal);
  }

  .notif-badge[data-type="booking"] {
    background: color-mix(in oklab, var(--color-accent-amber) 15%, transparent);
    color: var(--color-accent-amber);
  }

  .notif-name {
    font-size: 0.82rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
    min-width: 0;
  }

  .notif-preview {
    font-size: 0.78rem;
    color: color-mix(in oklab, var(--color-text-muted) 70%, transparent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .notif-date {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
    opacity: 0.7;
  }

  /* ---- Expanded detail ---- */
  .notif-detail {
    padding: 0 1rem 1rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    gap: 0.75rem;
  }

  .detail-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    width: 5rem;
    flex-shrink: 0;
    padding-top: 0.1rem;
  }

  .detail-value {
    font-size: 0.82rem;
    color: var(--color-text);
    line-height: 1.5;
  }

  .detail-message {
    white-space: pre-wrap;
  }

  .detail-actions {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.25rem;
    padding-left: 5.75rem;
  }

  /* ---- Subscriber rows ---- */
  .sub-row {
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .sub-row:last-child {
    border-bottom: none;
  }

  .sub-main {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.65rem 1rem;
  }

  .sub-status {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .sub-status[data-status="confirmed"] {
    background: color-mix(in oklab, var(--color-success) 15%, transparent);
    color: var(--color-success);
  }

  .sub-status[data-status="pending"] {
    background: color-mix(in oklab, var(--color-accent-amber) 15%, transparent);
    color: var(--color-accent-amber);
  }

  .sub-status[data-status="unsubscribed"] {
    background: color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    color: var(--color-text-muted);
  }

  .sub-email {
    font-size: 0.82rem;
    color: var(--color-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-name {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .sub-date {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    opacity: 0.7;
    flex-shrink: 0;
  }

  .remove-btn {
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    opacity: 0;
    padding: 4px;
    transition: opacity 0.15s, color 0.15s;
  }

  .sub-row:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    color: var(--color-error);
  }

  /* ---- Pagination ---- */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .pagination button {
    appearance: none;
    background: none;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    border-radius: 6px;
    padding: 0.35rem 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }

  .pagination button:hover:not(:disabled) {
    color: var(--color-text);
    border-color: var(--color-text-muted);
  }

  .pagination button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  /* ---- Empty ---- */
  .empty {
    text-align: center;
    padding: 3rem 1rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  /* ---- Responsive ---- */
  @media (max-width: 640px) {
    .notif-preview {
      display: none;
    }

    .notif-detail {
      padding-left: 1rem;
    }

    .detail-row {
      flex-direction: column;
      gap: 0.15rem;
    }

    .detail-label {
      width: auto;
    }

    .detail-actions {
      padding-left: 0;
    }

    .stats-bar {
      gap: 1rem;
    }

    .sub-name {
      display: none;
    }
  }
</style>
