import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

// GET all articles
export async function GET() {
  try {
    await connectDB();
    const articles = await Article.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new article
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const article = await Article.create(body);
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
