import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const findAllIncome = await this.find({ where: { type: 'income' } });
    const findAllOutcome = await this.find({ where: { type: 'outcome' } });
    let income = 0;
    findAllIncome.forEach(transaction => {
      income += transaction.value;
    });
    let outcome = 0;
    findAllOutcome.forEach(transaction => {
      outcome += transaction.value;
    });
    const balance = {
      income,
      outcome,
      total: income - outcome,
    };
    return balance;
  }
}

export default TransactionsRepository;
