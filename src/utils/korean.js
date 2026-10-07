// 받침 유무에 따라 조사를 붙여 줍니다. 예: withJosa('남해', '은', '는') → '남해는'
function lastCharCode(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 : -1; // -1: 한글이 아님
}

export function withJosa(word, withBatchim, withoutBatchim) {
  const jong = lastCharCode(word);
  // '으로/로'는 ㄹ 받침(8)일 때도 '로'를 씁니다.
  const isRo = withoutBatchim === '로';
  const useFirst = jong > 0 && !(isRo && jong === 8);
  return word + (useFirst ? withBatchim : withoutBatchim);
}
