import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';
import { Button } from '../ui/Button';

interface InviteCardProps {
  roomCode: string;
}

export const InviteCard: React.FC<InviteCardProps> = ({ roomCode }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(roomCode);
    if (ok) { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    const ok = await copyToClipboard(url);
    if (ok) { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
  };

  return (
    <div
      className="rounded-card border p-4 sm:p-5 shadow-sm space-y-4 transition-colors"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
    >
      <div>
        <span className="text-xs font-medium uppercase tracking-wider block mb-1" style={{ color: 'var(--text-ink-secondary)' }}>
          Kode Room
        </span>
        <div
          className="flex items-center justify-between gap-3 rounded-btn p-2.5 sm:p-3 border"
          style={{ backgroundColor: 'var(--bg-surface-secondary)', borderColor: 'var(--border-color)' }}
        >
          <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest pl-1" style={{ color: 'var(--text-ink)' }}>
            {roomCode}
          </span>
          <Button size="sm" variant="outline" onClick={handleCopyCode} className="h-8 px-3 text-xs shadow-none">
            {copiedCode ? (<><Check className="w-3.5 h-3.5 text-emerald-500" /> Tersalin</>) : (<><Copy className="w-3.5 h-3.5" /> Salin Kode</>)}
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <span className="text-xs" style={{ color: 'var(--text-ink-secondary)' }}>Ajak teman dengan link instan</span>
        <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-8 text-xs gap-1.5">
          {copiedLink ? (<><Check className="w-3.5 h-3.5 text-emerald-500" /> Link Tersalin</>) : (<><Share2 className="w-3.5 h-3.5" /> Salin Link Room</>)}
        </Button>
      </div>
    </div>
  );
};
