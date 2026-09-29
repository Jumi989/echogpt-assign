import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebSearchService {
  constructor(private readonly prisma: PrismaService) {}

async search(userId: string, query: string) {
  const cleanQuery = query.trim();

  // Cache for 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const cached = await this.prisma.webSearch.findFirst({
    where: {
      userId,
      query: cleanQuery,
      createdAt: {
        gte: tenMinutesAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (cached) {
    return {
      query: cached.query,
      results: JSON.parse(cached.results),
      cached: true,
      createdAt: cached.createdAt,
    };
  }

  try {
    const url =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query` +
      `&list=search` +
      `&srsearch=${encodeURIComponent(cleanQuery)}` +
      `&format=json` +
      `&utf8=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EchoGPT-Assignment/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Wikipedia returned ${response.status}`);
    }

    const data: any = await response.json();

    const results = (data.query?.search || [])
      .slice(0, 5)
      .map((item: any) => ({
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>/g, ''),
        url:
          'https://en.wikipedia.org/wiki/' +
          encodeURIComponent(item.title.replace(/ /g, '_')),
      }));

    await this.prisma.webSearch.create({
      data: {
        query: cleanQuery,
        results: JSON.stringify(results),
        userId,
      },
    });

    return {
      query: cleanQuery,
      results,
      cached: false,
    };
  } catch (error: any) {
    console.error('Web Search Error:', error?.message || error);

    throw new BadGatewayException('Web search failed');
  }
}

  async getHistory(userId: string) {
    const searches = await this.prisma.webSearch.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return searches.map((search) => ({
      id: search.id,
      query: search.query,
      createdAt: search.createdAt,
    }));
  }

  async getRecent(userId: string) {
    return this.prisma.webSearch.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        query: true,
        createdAt: true,
      },
    });
  }

  async getSuggestions(userId: string, text: string) {
    if (!text || text.trim().length < 1) {
      return [];
    }

    const searches = await this.prisma.webSearch.findMany({
      where: {
        userId,
        query: {
          contains: text.trim(),
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      select: {
        query: true,
      },
    });

    return [...new Set(searches.map((item) => item.query))].slice(0, 5);
  }
}