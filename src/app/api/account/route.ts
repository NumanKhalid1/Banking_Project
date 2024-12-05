import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        sentTransactions: true,
        receivedTransactions: true,
      },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { iban } = data;

    // Validate IBAN format (basic validation)
    if (!iban || !/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban)) {
      return NextResponse.json(
        { error: "Invalid IBAN format" },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: { iban },
    });

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
