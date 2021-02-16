/**
 *
 * @param {object} enumeration
 * @param {string} enumeration.value
 * @param {string} enumeration.documentation
 * @param {function} cleanDocs
 */
module.exports = ({ value, documentation }, cleanDocs) => {
  const lines = [];
  if (documentation) lines.push(`"""\n${cleanDocs(documentation)}\n"""`);
  lines.push(value);
  return lines.map((line) => `  ${line}`).join('\n');
};
