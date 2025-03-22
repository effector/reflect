/* eslint-disable react/react-in-jsx-scope */
import { useRouter } from 'next/router';
import { type DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <b>@effector/reflect</b>,
  project: {
    link: 'https://github.com/effector/reflect',
  },
  docsRepositoryBase: 'https://github.com/effector/reflect/blob/master/docs',
  darkMode: true,
  primaryHue: 35,
  navbar: {
    // extraContent: <>Link to Effector Docs</>,
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://github.com/effector" target="_blank">
          Effector Core Team
        </a>
      </span>
    ),
  },
  faviconGlyph: '☄️',
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s | @effector/reflect',
      };
    }
  },
};

export default config;
