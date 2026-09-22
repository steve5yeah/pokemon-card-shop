/**
 * 포켓몬 그림 주소 만들기
 *
 * PokeAPI(무료 공개 API, 가입·키 불필요)가 GitHub에 올려 둔 공식 일러스트를 씁니다.
 * 도감번호만 알면 주소를 조립할 수 있습니다. 예) 리자몽은 6번 → .../6.png
 *
 * 이 주소를 next/image 로 쓰려면 next.config.ts 의 images.remotePatterns 에
 * raw.githubusercontent.com 이 허용되어 있어야 합니다. (이미 넣어 두었습니다)
 */
const ARTWORK_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function pokeArtwork(pokedexNo: number | null | undefined): string | null {
  if (!pokedexNo) return null;
  return `${ARTWORK_BASE}/${pokedexNo}.png`;
}

/**
 * 카드에 보여줄 그림을 고릅니다.
 *   1순위 — 관리자가 직접 올린 사진(image_url)
 *   2순위 — 도감번호로 만든 PokeAPI 공식 일러스트
 *   없으면 null (화면에서 몬스터볼 그림을 대신 보여줍니다)
 */
export function cardImage(product: {
  image_url?: string | null;
  pokedex_no?: number | null;
}): string | null {
  return product.image_url || pokeArtwork(product.pokedex_no);
}
