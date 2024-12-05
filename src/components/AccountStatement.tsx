"use client";

import { useState, useEffect } from "react";
import { Account } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  fromAccount: Account | null;
  toAccount: Account | null;
  createdAt: string;
}

interface AccountStatementProps {
  accounts: Account[];
}

export function AccountStatement({ accounts }: AccountStatementProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions();
    }
  }, [selectedAccountId]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `/api/transaction?accountId=${selectedAccountId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTransactionAmount = (transaction: Transaction) => {
    if (transaction.type === "DEPOSIT") {
      return `+${transaction.amount}`;
    }
    if (transaction.type === "WITHDRAWAL") {
      return `-${transaction.amount}`;
    }
    if (transaction.type === "TRANSFER") {
      return transaction.fromAccount?.id === selectedAccountId
        ? `-${transaction.amount}`
        : `+${transaction.amount}`;
    }
    return transaction.amount;
  };

  const calculateRunningBalance = (
    transactions: Transaction[],
    accountId: string
  ) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return [];

    let balance = account.balance;
    return transactions
      .map((transaction) => {
        const amount = parseFloat(getTransactionAmount(transaction));
        balance -= amount;
        return { ...transaction, balance };
      })
      .reverse();
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
        <SelectTrigger>
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.iban} (Balance: ${account.balance})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAccountId && transactions.length > 0 ? (
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {calculateRunningBalance(transactions, selectedAccountId).map(
                (transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t bg-card transition-colors hover:bg-muted/50"
                  >
                    <td className="p-3">{formatDate(transaction.createdAt)}</td>
                    <td className="p-3">{transaction.type}</td>
                    <td className="p-3">
                      {transaction.type === "TRANSFER"
                        ? `${
                            transaction.fromAccount?.id === selectedAccountId
                              ? "To"
                              : "From"
                          } ${
                            transaction.fromAccount?.id === selectedAccountId
                              ? transaction.toAccount?.iban
                              : transaction.fromAccount?.iban
                          }`
                        : transaction.type}
                    </td>
                    <td
                      className={`p-3 text-right ${
                        parseFloat(getTransactionAmount(transaction)) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {getTransactionAmount(transaction)}
                    </td>
                    <td className="p-3 text-right">
                      ${transaction.balance.toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        selectedAccountId && (
          <p className="text-center text-muted-foreground">
            No transactions found
          </p>
        )
      )}
    </div>
  );
}
