import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const newtransaction = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await newtransaction.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You dont have enough balance');
    }

    // eslint-disable-next-line prefer-const
    let categoryTransaction = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryTransaction) {
      categoryTransaction = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryTransaction);
    }

    const transaction = newtransaction.create({
      title,
      value,
      type,
      category: categoryTransaction,
    });

    await newtransaction.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
