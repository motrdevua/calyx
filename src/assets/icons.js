/**
 * Centralized SVG Icon path data and viewBoxes.
 */

export const ICONS = {
  PLUS: {
    viewBox: '0 0 24 24',
    content:
      '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  },
  EDIT: {
    viewBox: '0 0 24 24',
    content:
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
  },
  TRASH: {
    viewBox: '0 0 24 24',
    content:
      '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
  },
  GEAR: {
    viewBox: '0 0 24 24',
    content:
      '<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41l-0.36,2.54c-0.59,0.24-1.13,0.57-1.62,0.94L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12c0,0.31,0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />',
  },
  CHECK: {
    viewBox: '0 0 24 24',
    content: '<polyline points="20 6 9 17 4 12"></polyline>',
  },
  DOWNLOAD: {
    viewBox: '0 0 24 24',
    content:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
  },
  UPLOAD: {
    viewBox: '0 0 24 24',
    content:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
  },
  LOGO: {
    viewBox: '0 0 32 32',
    content: `
      <defs>
        <linearGradient id="calyx-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1da2fc" />
          <stop offset="100%" stop-color="#0066cc" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12L16 2Z" fill="url(#calyx-gradient)" filter="url(#glow)" />
      <circle cx="16" cy="16" r="4" fill="white" fill-opacity="0.9" />
      <circle cx="16" cy="16" r="2" fill="#1da2fc" />
      <path d="M16 6V10" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      <path d="M16 22V26" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      <path d="M6 16H10" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      <path d="M22 16H26" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    `,
  },
};
