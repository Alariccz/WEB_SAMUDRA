/**
 * SAMUDRA Admin Custom Confirmation Modal Dialog
 * Menggantikan window.confirm() native dengan modal UI Glassmorphism mewah
 */

export function showConfirmModal({
  title = 'Konfirmasi Tindakan',
  subtitle = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  itemName = '',
  itemDetails = '',
  warningText = 'Tindakan ini permanen dan tidak dapat dibatalkan.',
  confirmLabel = 'Hapus Permanen',
  cancelLabel = 'Batal',
  confirmVariant = 'danger', // 'danger' | 'amber' | 'primary'
  onConfirm
}) {
  return new Promise((resolve) => {
    // Cari root modal container atau tempelkan ke document.body
    let container = document.getElementById('adm-confirm-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adm-confirm-modal-root';
      document.body.appendChild(container);
    }

    const isDanger = confirmVariant === 'danger';
    const accentColor = isDanger ? 'var(--adm-rose)' : confirmVariant === 'amber' ? 'var(--adm-amber)' : 'var(--adm-cyan)';
    const accentBg = isDanger ? 'rgba(244, 63, 94, 0.12)' : confirmVariant === 'amber' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 210, 255, 0.12)';
    const accentBorder = isDanger ? 'rgba(244, 63, 94, 0.35)' : confirmVariant === 'amber' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 210, 255, 0.35)';

    container.innerHTML = `
      <div class="adm-modal-backdrop adm-modal-backdrop--open" id="adm-custom-confirm-backdrop" style="z-index: 9999;">
        <div class="adm-modal adm-confirm-dialog" style="max-width: 460px; border-color: ${accentBorder}; box-shadow: var(--adm-shadow), 0 0 50px -15px ${accentBorder};">
          
          <div style="padding: 28px 28px 20px;">
            <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px;">
              <div style="width: 48px; height: 48px; border-radius: var(--adm-radius-md); background: ${accentBg}; border: 1px solid ${accentBorder}; display: flex; align-items: center; justify-content: center; color: ${accentColor}; flex-shrink: 0;">
                ${isDanger ? `
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                  </svg>
                ` : `
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                `}
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">${escapeHtml(title)}</h3>
                <p style="margin: 0; font-size: 13px; color: var(--adm-text-dim); line-height: 1.45;">${escapeHtml(subtitle)}</p>
              </div>
            </div>

            ${itemName ? `
              <div style="padding: 12px 16px; border-radius: var(--adm-radius-sm); background: rgba(14, 27, 44, 0.85); border: 1px solid var(--adm-border); margin-bottom: 16px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--adm-text-dim); margin-bottom: 4px; font-weight: 600;">Item yang dipilih</div>
                <div style="font-size: 14px; font-weight: 600; color: #ffffff; word-break: break-word;">${escapeHtml(itemName)}</div>
                ${itemDetails ? `<div style="font-size: 12px; color: var(--adm-text-muted); margin-top: 4px; font-family: var(--adm-mono);">${escapeHtml(itemDetails)}</div>` : ''}
              </div>
            ` : ''}

            ${warningText ? `
              <div style="padding: 10px 14px; border-radius: var(--adm-radius-sm); background: ${accentBg}; border: 1px solid ${accentBorder}; color: ${accentColor}; font-size: 12px; line-height: 1.45; display: flex; align-items: center; gap: 8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>${escapeHtml(warningText)}</span>
              </div>
            ` : ''}
          </div>

          <div class="adm-modal__footer" style="padding: 16px 28px; background: rgba(10, 20, 34, 0.65);">
            <button class="adm-btn adm-btn--glass adm-btn--sm" id="adm-confirm-cancel-btn" type="button" style="padding: 9px 20px;">
              ${escapeHtml(cancelLabel)}
            </button>
            <button class="adm-btn ${isDanger ? 'adm-btn--danger' : confirmVariant === 'amber' ? 'adm-btn--amber' : 'adm-btn--white'} adm-btn--sm" id="adm-confirm-ok-btn" type="button" style="padding: 9px 22px;">
              <span id="adm-confirm-ok-label">${escapeHtml(confirmLabel)}</span>
            </button>
          </div>

        </div>
      </div>
    `;

    const backdrop = container.querySelector('#adm-custom-confirm-backdrop');
    const cancelBtn = container.querySelector('#adm-confirm-cancel-btn');
    const okBtn = container.querySelector('#adm-confirm-ok-btn');
    const okLabel = container.querySelector('#adm-confirm-ok-label');

    const cleanup = () => {
      document.removeEventListener('keydown', handleKey);
      if (backdrop) backdrop.classList.remove('adm-modal-backdrop--open');
      setTimeout(() => {
        container.innerHTML = '';
      }, 200);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
      }
    };
    document.addEventListener('keydown', handleKey);

    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };

    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        cleanup();
        resolve(false);
      }
    };

    okBtn.onclick = async () => {
      okBtn.disabled = true;
      if (okLabel) {
        okLabel.innerHTML = `
          <svg class="adm-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line></svg>
          Memproses...
        `;
      }

      try {
        if (typeof onConfirm === 'function') {
          await onConfirm();
        }
        cleanup();
        resolve(true);
      } catch (err) {
        okBtn.disabled = false;
        if (okLabel) okLabel.textContent = confirmLabel;
      }
    };
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

