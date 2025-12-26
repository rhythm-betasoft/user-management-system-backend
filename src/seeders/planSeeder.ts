import { AppDataSource } from "../dataSource";
import { Plan } from "../entity/plan";
import {BillingCycle} from '../constants/enums'
import { Feature } from "../entity/planFeatures";

export const Plans = async () => {
  const planRepo = AppDataSource.getRepository(Plan);
  const featureRepo = AppDataSource.getRepository(Feature);

  if (await planRepo.count()) return;

  const featureData = [
    { name: "Leave Management" },
    { name: "Attendance Management" },
    { name: "User Management" },
    { name: "Announcement Management"},
    {name: "Permission-Based Control"},
  ];

  const features = await featureRepo.save(featureData);

  const createPlan = (
    name: string,
    billingCycle: BillingCycle,
    price: number,
    featureNames: string[]
  ) => {
    const plan = new Plan();
    plan.name = name;
    plan.billingCycle = billingCycle;
    plan.price = price;

    plan.featureIds = features
      .filter(f => featureNames.includes(f.name))
      .map(f => f.id);

    return plan;
  };

  const silverFeatures = [
    "User Management",
    "Attendance Management",
  ];

  const goldFeatures = [
    ...silverFeatures,
   "Leave Management",
   "Permission-Based Control",
  "Announcement Management",
  ];

  await planRepo.save([
    createPlan("Silver", BillingCycle.MONTHLY, 100, silverFeatures),
    createPlan("Silver", BillingCycle.YEARLY, 1000, silverFeatures),
    createPlan("Gold", BillingCycle.MONTHLY, 150, goldFeatures),
    createPlan("Gold", BillingCycle.YEARLY, 1500, goldFeatures),
  ]);
};