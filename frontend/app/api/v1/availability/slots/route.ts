import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const fulfillmentType = searchParams.get('fulfillmentType') || 'DELIVERY';

  const defaultSlots = [
    {
      id: "slot-1",
      slotDate: date,
      startTime: "12:00",
      endTime: "15:00",
      timeDisplay: "12:00 م - 03:00 م (ظهراً)",
      timeRangeDisplay: "12:00 م - 03:00 م",
      fulfillmentType,
      maxCapacity: 10,
      reservedCount: 2,
      remainingCapacity: 8,
      available: true,
      isAvailable: true,
    },
    {
      id: "slot-2",
      slotDate: date,
      startTime: "15:00",
      endTime: "18:00",
      timeDisplay: "03:00 م - 06:00 م (عصراً)",
      timeRangeDisplay: "03:00 م - 06:00 م",
      fulfillmentType,
      maxCapacity: 10,
      reservedCount: 3,
      remainingCapacity: 7,
      available: true,
      isAvailable: true,
    },
    {
      id: "slot-3",
      slotDate: date,
      startTime: "18:00",
      endTime: "21:00",
      timeDisplay: "06:00 م - 09:00 م (مساءً)",
      timeRangeDisplay: "06:00 م - 09:00 م",
      fulfillmentType,
      maxCapacity: 10,
      reservedCount: 1,
      remainingCapacity: 9,
      available: true,
      isAvailable: true,
    },
    {
      id: "slot-4",
      slotDate: date,
      startTime: "21:00",
      endTime: "23:59",
      timeDisplay: "09:00 م - 12:00 ص (سهرة)",
      timeRangeDisplay: "09:00 م - 12:00 ص",
      fulfillmentType,
      maxCapacity: 10,
      reservedCount: 4,
      remainingCapacity: 6,
      available: true,
      isAvailable: true,
    },
  ];

  return NextResponse.json({
    success: true,
    message: "Operation successful",
    data: defaultSlots,
    timestamp: new Date().toISOString(),
  });
}
