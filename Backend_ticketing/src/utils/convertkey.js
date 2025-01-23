import bs58 from "bs58";

const base58Key =
	"3s2ZuRCjcEaLiofgYfPXznLgMDZJWy1YTavrbjGhEZ3c5Tb2Uzu3zZBRLbqc3mxZ96nUaWHMwFTWDyDTEaac7eNE";
const keyArray = bs58.decode(base58Key);

console.log(JSON.stringify(Array.from(keyArray)));
