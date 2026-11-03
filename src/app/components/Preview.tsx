import { useEffect, useRef } from 'react';
import type { WidgetConfig } from '../../domain/config';
import { renderWidgetMarkup } from '../../domain/render/html';
import type { QrModules } from '../../domain/render/svg';
import '../../widget/runtime.js';

/** Live preview using the exact markup and runtime that get exported. */
export function Preview({ config, qr }: { config: WidgetConfig; qr: QrModules | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = renderWidgetMarkup(config, qr);
  }, [config, qr]);
  return <div ref={ref} className="preview" />;
}
