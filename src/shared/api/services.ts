import * as yup from "yup";
import { instance } from "./instance";

const orderSchema = yup.object({
  order: yup
    .array()
    .of(yup.number().integer().min(1).max(1_000_000))
    .required(),
});

const selectionSchema = yup.array().of(
  yup.object({
    id: yup.number().integer().min(1).max(1_000_000).required(),
    selected: yup.boolean().required(),
  })
);

export class ApiService {
  static async fetchItems(search: string, offset: number, limit: number) {
    const params = new URLSearchParams({
      search,
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const { data } = await instance.get(`/items?${params.toString()}`);
    return data;
  }

  static async updateOrder(order: number[]) {
    await orderSchema.validate({ order }, { abortEarly: false });

    await instance.post("/order", { order });
  }

  static async updateSelection(
    selections: { id: number; selected: boolean }[]
  ) {
    await selectionSchema.validate(selections, { abortEarly: false });

    await instance.post("/select", selections);
  }
}
