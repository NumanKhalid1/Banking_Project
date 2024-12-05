"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Account } from "@prisma/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER"]),
  amount: z.number().positive("Amount must be positive"),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  accounts: Account[];
  onSuccess: () => void;
}

export function TransactionForm({ accounts, onSuccess }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<
    "DEPOSIT" | "WITHDRAWAL" | "TRANSFER"
  >("DEPOSIT");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "DEPOSIT",
      amount: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process transaction");
      }

      toast({
        title: "Success",
        description: "Transaction processed successfully",
      });
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <div className="space-y-2">
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setTransactionType(value as any);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            )}
          />

          {(transactionType === "WITHDRAWAL" ||
            transactionType === "TRANSFER") && (
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormLabel>From Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.iban} (Balance: ${account.balance})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              )}
            />
          )}

          {(transactionType === "DEPOSIT" ||
            transactionType === "TRANSFER") && (
            <FormField
              control={form.control}
              name="toAccountId"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormLabel>To Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.iban} (Balance: ${account.balance})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <div className="space-y-2">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </div>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Processing..."
              : "Process Transaction"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
