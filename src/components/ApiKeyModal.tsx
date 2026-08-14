import React from 'react';
import { X, Key, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasValidKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, hasValidKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-black text-white">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Google Maps Platform Key Setup</h3>
              <p className="text-xs text-neutral-500 font-medium">Map rendering & place data configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-black rounded-xl bg-neutral-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasValidKey ? (
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Google Maps API Key is Active!</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Your Google Maps Platform key is detected and configured. Map tiles and place markers will render natively.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-neutral-700">
            <p className="text-black font-semibold">
              NaijaNav has a built-in canvas map that works without a key. To render live Google Maps tiles instead:
            </p>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-neutral-200 space-y-3">
              <h4 className="font-extrabold text-black text-sm">Setup:</h4>
              <ol className="list-decimal list-inside space-y-2 leading-relaxed text-neutral-700 font-medium">
                <li>
                  Get a Google Maps API key from{' '}
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-black underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Restrict the key to your domain in Cloud Console (HTTP referrer restriction) — it will be visible
                  in client-side code
                </li>
                <li>
                  Set it as <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-black font-mono font-bold">GOOGLE_MAPS_PLATFORM_KEY</code>{' '}
                  in your environment / secrets
                </li>
                <li>Rebuild or restart the dev server</li>
              </ol>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
        >
          Close & Continue Navigation
        </button>
      </div>
    </div>
  );
};
