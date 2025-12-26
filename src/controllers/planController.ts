import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Plan } from "../entity/plan";
import { Feature } from "../entity/planFeatures";

const planRepo = AppDataSource.getRepository(Plan);
const featureRepo = AppDataSource.getRepository(Feature);

export class PlanController {
  async getPlans(req: Request, res: Response) {
    console.log("aaaaa")
    const plans = await planRepo.find();
    res.json({ success: true, data: plans });
  }

  async getAllFeatures(req: Request, res: Response) {
    const features = await featureRepo.find();
    res.json({ success: true, data: features });
  }

  async savePlan(req: Request, res: Response) {
    const { planId, billingCycle, price, featureIds } = req.body;

    const plan = await planRepo.findOne({ where: { id: planId, billingCycle } });
    if (!plan) return res.status(404).json({ success: false });

    plan.price = price;
    plan.featureIds = featureIds;

    await planRepo.save(plan);
    res.json({ success: true });
  }
}

