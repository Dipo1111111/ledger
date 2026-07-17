export interface LoanContract {
  id: string;
  type: 'loan';
  borrowerId: string;
  amount: number;
  interestRate: number;
  repaymentAmount: number;
  deadlineRound: number;
  createdAtRound: number;
  isDefaulted: boolean;
  isRepaid: boolean;
}

export interface InvestmentContract {
  id: string;
  type: 'investment';
  investorId: string;
  receiverId: string;
  amount: number;
  repaymentAmount: number;
  deadlineRound: number;
  createdAtRound: number;
  isDefaulted: boolean;
  isRepaid: boolean;
}

/**
 * A pending investment offer awaiting the receiver's acceptance.
 */
export interface InvestmentOffer {
  id: string;
  investorId: string;
  receiverId: string;
  amount: number;
  repaymentAmount: number;
  deadlineRound: number;
  createdAtRound: number;
}

export type Contract = LoanContract | InvestmentContract;
