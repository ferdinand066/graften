"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputNumber from "@/components/ui/custom/input-number";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createItemSchema, itemEmptySchemaValue, type CreateItemInput } from "schema/item.schema";
import type { ItemModel } from "types/item";
import { ConditionalFieldInput } from "./conditional-field-input";

interface ItemFormProps {
  editingItem?: ItemModel | null;
  onSubmit: (data: CreateItemInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ItemForm({ editingItem, onSubmit, onCancel, isSubmitting }: ItemFormProps) {
  const { data: categoriesData } = api.category.getAllForDropdown.useQuery({
    showTotalItem: false,
  });

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: editingItem?.name ?? itemEmptySchemaValue.name,
      description: editingItem?.description ?? itemEmptySchemaValue.description,
      price: editingItem?.price ?? itemEmptySchemaValue.price,
      minimumQuantity: editingItem?.minimumQuantity ?? itemEmptySchemaValue.minimumQuantity,
      maximumQuantity: editingItem?.maximumQuantity ?? itemEmptySchemaValue.maximumQuantity,
      circulation: editingItem?.circulation ?? itemEmptySchemaValue.circulation,
      status: editingItem?.status ?? itemEmptySchemaValue.status,
      conditionalFields: editingItem?.conditionalFields ?? null,
      categoryId: editingItem?.category.id ?? itemEmptySchemaValue.categoryId,
    },
  });

  const handleSubmit = (data: CreateItemInput) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    form.reset(itemEmptySchemaValue);
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingItem ? "Edit Item" : "Create New Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
              <div className="col-span-1 md:col-span-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <div className="col-span-1 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={!!editingItem}>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesData?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="minimumQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Quantity *</FormLabel>
                      <FormControl>
                        <InputNumber
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="col-span-1 md:col-span-2">
                 <FormField
                   control={form.control}
                   name="maximumQuantity"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Maximum Quantity</FormLabel>
                       <FormControl>
                          <InputNumber
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Optional"
                          />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="circulation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Circulation *</FormLabel>
                      <FormControl>
                        <InputNumber
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="col-span-1 md:col-span-3">
                 <FormField
                   control={form.control}
                   name="price"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Base Price</FormLabel>
                         <FormControl>
                          <InputNumber
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0.00"
                            allowDecimals={true}
                            maxDecimals={2}
                          />
                        </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

              <div className="col-span-1 md:col-span-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-6">
                <FormField
                  control={form.control}
                  name="conditionalFields"
                  render={({ field }) => (
                    <FormItem>
                      <ConditionalFieldInput field={field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingItem
                    ? "Update Item"
                    : "Create Item"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
