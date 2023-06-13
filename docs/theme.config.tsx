/* eslint-disable react/react-in-jsx-scope */
import { useRouter } from 'next/router';
import { type DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <b>@effector/reflect</b>,
  project: {
    link: 'https://github.com/effector/reflect',
  },
  docsRepositoryBase: 'https://github.com/effector/reflect/blob/master/docs/pages',
  darkMode: true,
  primaryHue: 35,
  banner: {
    dismissible: true,
    key: 'reflect v9 announce',
    text: (
      <a href="https://github.com/effector/reflect/issues/44" target="_blank">
        <b>@effector/reflect</b> v9 will be released soon! Check the updates →
      </a>
    ),
  },
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
