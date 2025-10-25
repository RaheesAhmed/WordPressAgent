import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, avatar } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: id, email' },
        { status: 400 }
      );
    }

    // Upsert user in our custom users table
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name,
        avatar,
        updatedAt: new Date(),
      },
      create: {
        id,
        email,
        name,
        avatar,
        plan: 'FREE',
        credits: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
      }
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}