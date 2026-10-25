import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'SpaceDraw | Real-time Drawing & Guessing Game',
  description: 'SpaceDraw - Premium Monochrome Drawing and Guessing Game with glassmorphism UI, interactive canvas, and simulated multiplayer.',
  openGraph: {
    title: 'SpaceDraw | Real-time Drawing & Guessing Game',
    description: 'SpaceDraw - Premium Monochrome Drawing and Guessing Game with glassmorphism UI, interactive canvas, and simulated multiplayer.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpaceDraw | Real-time Drawing & Guessing Game',
    description: 'SpaceDraw - Premium Monochrome Drawing and Guessing Game with glassmorphism UI, interactive canvas, and simulated multiplayer.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var desc = Object.getOwnPropertyDescriptor(window, 'fetch');
                  if (desc && !desc.writable) {
                    var _origFetch = window.fetch;
                    var _currentFetch = _origFetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return _currentFetch; },
                      set: function(v) { _currentFetch = v; },
                      configurable: true,
                      enumerable: true
                    });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
