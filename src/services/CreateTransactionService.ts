import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  value: number;
  title: string;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    value,
    title,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('This transaction is not permited');
    }
    const checkCategoryExistis = await categoryRepository.findOne({
      where: { title: category },
    });

    if (checkCategoryExistis) {
      const transaction = transactionsRepository.create({
        value,
        title,
        type,
        category_id: checkCategoryExistis.id,
      });

      await transactionsRepository.save(transaction);
      return transaction;
    }

    const createCategory = categoryRepository.create({ title: category });
    await categoryRepository.save(createCategory);
    const transaction = transactionsRepository.create({
      value,
      title,
      type,
      category_id: createCategory.id,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
