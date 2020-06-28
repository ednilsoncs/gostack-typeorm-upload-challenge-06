/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface Request {
  filePath: string;
}

interface CSVTransaction {
  value: number;
  title: string;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const csvTransactions: CSVTransaction[] = [];
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const csvFilePath = path.join(uploadConfig.directory, filePath);
    const csvReadStrem = fs.createReadStream(csvFilePath);

    const parsers = csvParse({
      from_line: 2,
    });
    const parseCSV = csvReadStrem.pipe(parsers);
    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      csvTransactions.push({ category, value, type, title });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));
    const transactionsCreated: Transaction[] = [];

    const balance = await transactionsRepository.getBalance();

    const balanceCreate: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };
    csvTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balanceCreate.income += Number(transaction.value);
      } else {
        balanceCreate.outcome += Number(transaction.value);
      }
    });

    balanceCreate.total = balanceCreate.income - balanceCreate.outcome;

    if (balance.total + balanceCreate.total < 0) {
      throw new AppError('This transaction is not permited');
    }
    const createTransaction = new CreateTransactionService();
    for (const { category, title, type, value } of csvTransactions) {
      const transactionCreate = await createTransaction.execute({
        title,
        category,
        type,
        value,
      });

      transactionsCreated.push(transactionCreate);
    }
    await fs.promises.unlink(csvFilePath);
    return transactionsCreated;
  }
}

export default ImportTransactionsService;
