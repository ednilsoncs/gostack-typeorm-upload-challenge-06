import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const checkIfTransactionsExists = await transactionsRepository.findOne(id);

    if (!checkIfTransactionsExists) {
      throw new AppError('Transaction not found', 404);
    }

    await transactionsRepository.delete(id);
    // TODO
  }
}

export default DeleteTransactionService;
