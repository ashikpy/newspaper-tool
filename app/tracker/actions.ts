"use server";

import prisma from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getTrackedDays(year: number, month: number) {
  const { userId } = await auth();
  if (!userId) return [];
  
  // We fetch a wide range or just the specific month
  // Month is 0-indexed in JS, so to get bounds:
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const tracks = await prisma.trackedDay.findMany({
    where: {
      clerkId: userId,
      date: {
        gte: startDate,
        lte: endDate,
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

  const date = new Date(dateIso);

  // Check if it exists
  const existing = await prisma.trackedDay.findUnique({
    where: {
      clerkId_date_vendorName: {
        clerkId: userId,
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
        clerkId: userId,
        date: date,
        vendorName: vendorName
      }
    });
  }
}
