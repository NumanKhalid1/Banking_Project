"use client";

import { useState, useEffect } from "react";
import { AccountForm } from "@/components/AccountForm";
import { TransactionForm } from "@/components/TransactionForm";
import { AccountStatement } from "@/components/AccountStatement";
import { Account } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/account");
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold">Banking App</h1>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <Tabs defaultValue="create-account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create-account">Create Account</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="statement">Account Statement</TabsTrigger>
            </TabsList>
            <TabsContent value="create-account">
              <AccountForm onSuccess={fetchAccounts} />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionForm accounts={accounts} onSuccess={fetchAccounts} />
            </TabsContent>
            <TabsContent value="statement">
              <AccountStatement accounts={accounts} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
