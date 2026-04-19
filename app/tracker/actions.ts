"use server";

import prisma from "../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function syncUser(clerkId: string) {
  if (!clerkId) return;
  const user = await currentUser();
  if (!user) return;

  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

  try {
    await prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: { clerkId, email, name },
    });
  } catch (error) {
    console.error("UPSERT ERROR:", { clerkId, email, name });
    throw error;
  }
}

export async function getTrackedDays(year: number, month: number) {
  const { userId } = await auth();
  if (!userId) return [];
  
  await syncUser(userId);

  // Month is 0-indexed in JS. 
  // We want to cover the entire range from the first of the month to the last.
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 1)); // Start of next month

  const tracks = await prisma.trackedDay.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate,
        lt: endDate,
      }
    }
  });
  
  return tracks.map(t => ({
    id: t.id,
    date: t.date.toISOString(),
    vendorName: t.vendorName
  }));
}

export async function toggleTrackedDay(dateIso: string, vendorName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncUser(userId);

  const date = new Date(dateIso);

  // Check if it exists (Prisma 7 uses userId in the constraint name now)
  const existing = await prisma.trackedDay.findUnique({
    where: {
      userId_date_vendorName: {
        userId: userId,
        date: date,
        vendorName: vendorName
      }
    }
  });

  if (existing) {
    await prisma.trackedDay.delete({ where: { id: existing.id } });
  } else {
    await prisma.trackedDay.create({
      data: {
        userId: userId,
        date: date,
        vendorName: vendorName
      }
    });
  }
}

export async function bulkTrackDays(dateIsos: string[], vendorName: string, shouldTrack: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncUser(userId);

  if (shouldTrack) {
    for (const iso of dateIsos) {
      const date = new Date(iso);
      await prisma.trackedDay.upsert({
        where: {
          userId_date_vendorName: {
            userId: userId,
            date: date,
            vendorName: vendorName
          }
        },
        create: {
          userId: userId,
          date: date,
          vendorName: vendorName
        },
        update: {} 
      });
    }
  } else {
    const dates = dateIsos.map(iso => new Date(iso));
    await prisma.trackedDay.deleteMany({
      where: {
        userId: userId,
        vendorName: vendorName,
        date: { in: dates }
      }
    });
  }
}

export async function getVendorConfigs() {
  const { userId } = await auth();
  if (!userId) return [];
  
  await syncUser(userId);

  // Robust lookup for the model property
  const modelKey = Object.keys(prisma).find(k => k.toLowerCase() === "vendorconfig") || "vendorConfig";
  const model = (prisma as any)[modelKey];

  if (!model) {
    console.error("CRITICAL: vendorConfig model not found on prisma client. Available keys:", Object.keys(prisma));
    return [];
  }

  return await model.findMany({
    where: { userId: userId }
  });
}

export async function updateVendorConfig(vendorName: string, upiVpa: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncUser(userId);

  const modelKey = Object.keys(prisma).find(k => k.toLowerCase() === "vendorconfig") || "vendorConfig";
  const model = (prisma as any)[modelKey];

  if (!model) throw new Error("VendorConfig model not found");

  await model.upsert({
    where: {
      userId_vendorName: {
        userId: userId,
        vendorName: vendorName
      }
    },
    update: { upiVpa: upiVpa },
    create: {
      userId: userId,
      vendorName: vendorName,
      upiVpa: upiVpa
    }
  });

  revalidatePath("/tracker");
}
