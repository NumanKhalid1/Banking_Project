import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, amount, fromAccountId, toAccountId } = data;

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    switch (type) {
      case "DEPOSIT": {
        const account = await prisma.account.findUnique({
          where: { id: toAccountId },
        });

        if (!account) {
          return NextResponse.json(
            { error: "Account not found" },
            { status: 404 }
          );
        }

        const [transaction, _] = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type,
              amount,
              toAccountId,
            },
          }),
          prisma.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } },
          }),
        ]);

        return NextResponse.json(transaction);
      }

      case "WITHDRAWAL": {
        const account = await prisma.account.findUnique({
          where: { id: fromAccountId },
        });

        if (!account) {
          return NextResponse.json(
            { error: "Account not found" },
            { status: 404 }
          );
        }

        if (account.balance < amount) {
          return NextResponse.json(
            { error: "Insufficient funds" },
            { status: 400 }
          );
        }

        const [transaction, _] = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type,
              amount,
              fromAccountId,
            },
          }),
          prisma.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } },
          }),
        ]);

        return NextResponse.json(transaction);
      }

      case "TRANSFER": {
        const [fromAccount, toAccount] = await Promise.all([
          prisma.account.findUnique({ where: { id: fromAccountId } }),
          prisma.account.findUnique({ where: { id: toAccountId } }),
        ]);

        if (!fromAccount || !toAccount) {
          return NextResponse.json(
            { error: "One or both accounts not found" },
            { status: 404 }
          );
        }

        if (fromAccount.balance < amount) {
          return NextResponse.json(
            { error: "Insufficient funds" },
            { status: 400 }
          );
        }

        const [transaction, _, __] = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type,
              amount,
              fromAccountId,
              toAccountId,
            },
          }),
          prisma.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } },
          }),
          prisma.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } },
          }),
        ]);

        return NextResponse.json(transaction);
      }

      default:
        return NextResponse.json(
          { error: "Invalid transaction type" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
