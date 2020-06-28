import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

import TransactionsRepository from '../repositories/TransactionsRepository';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;
  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    category,
    type,
    value,
  });

  return response.json(transaction);
  // TODO
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  // TODO
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({
    id,
  });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute({
      filePath: request.file.filename,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
