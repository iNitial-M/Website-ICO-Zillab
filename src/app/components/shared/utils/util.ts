import { AppConstants } from './constants';

export function formatBalance(weiBalance: string): string {
  var res = weiBalance;
  return (+res).toFixed(AppConstants.CUT_AFTER_BEFORE_BALANCE_LENGTH);
}
