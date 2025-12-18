import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Spend } from "../entity/Spend";

const spendRepo = AppDataSource.getRepository(Spend);
export const getAllSpends = async (req: Request, res: Response) => {
  try {
    const spends = await spendRepo.find();
    const gridData = spends;

    const first = spends[0] || {};
    const chartData = [
      { type: "Salary", value: first.salary || 0 },
      { type: "Expenses", value: first.expenses || 0 },
      { type: "Saving", value: first.saving || 0 },
    ];
    res.json({
      gridData,
      chartData,
      totalCount: spends.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching spends", error });
  }
};


export const createSpend = async (req: Request, res: Response) => {
  try {
    const { salary, expenses, saving } = req.body;
    const spend = spendRepo.create({ salary, expenses, saving });
    const result = await spendRepo.save(spend);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating spend", error });
  }
};
