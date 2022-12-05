export function pad(str: string, len: number) {
  return str.padEnd(len, String.fromCharCode(0x00));
}export function getCurrentPayrollIndex(currentAt: number, rewardPeriod: number, startAt: number) {
  return Math.floor((currentAt - startAt) / rewardPeriod) + 1;
}
