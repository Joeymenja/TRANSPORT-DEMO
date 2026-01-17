import emStyled from '@emotion/styled';
import { serializeStyles as emSerializeStyles } from '@emotion/serialize';
import { ThemeContext, keyframes, css } from '@emotion/react';

// Relative imports to node_modules to avoid circular alias resolution
import StyledEngineProvider from '../node_modules/@mui/styled-engine/esm/StyledEngineProvider/index.js';
import GlobalStyles from '../node_modules/@mui/styled-engine/esm/GlobalStyles/index.js';

const emStyledInternal = emStyled.default || emStyled;

export default function styled(tag, options) {
  return emStyledInternal(tag, options);
}

const styledExport = styled;
export { styledExport as styled };

export function internal_mutateStyles(tag, processor) {
  // Emotion attaches all the styles as `__emotion_styles`.
  // Ref: https://github.com/emotion-js/emotion/blob/16d971d0da229596d6bcc39d282ba9753c9ee7cf/packages/styled/src/base.js#L186
  if (Array.isArray(tag.__emotion_styles)) {
    tag.__emotion_styles = processor(tag.__emotion_styles);
  }
}

const wrapper = [];
export function internal_serializeStyles(styles) {
  wrapper[0] = styles;
  return emSerializeStyles(wrapper);
}

export { ThemeContext, keyframes, css, StyledEngineProvider, GlobalStyles };
