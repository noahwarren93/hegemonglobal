// CountryFlag.jsx - Renders emoji flags or image-based flags (e.g. Somaliland SVG)
/* eslint-disable react-refresh/only-export-components */

export default function CountryFlag({ flag, size }) {
  if (flag && flag.startsWith('data:')) {
    const s = size || '1em';
    return <img src={flag} alt="" style={{ width: s, height: s, verticalAlign: 'middle', display: 'inline-block' }} />;
  }
  return flag || '';
}

export function flagToHTML(flag, size) {
  if (flag && flag.startsWith('data:')) {
    const s = size || '1em';
    return '<img src="' + flag + '" alt="" style="width:' + s + ';height:' + s + ';vertical-align:middle;display:inline-block">';
  }
  return flag || '';
}
