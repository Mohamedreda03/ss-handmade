"use server";

import { db } from "@/lib/db";

// Update the SuccessStory interface to handle null values
export interface SuccessStory {
  id: string;
  name: string;
  profession: string;
  story: string;
  achievement: string;
  course?: string | null;
  imageUrl?: string | null;
}

/**
 * Fetch success stories from the database
 * @param limit Number of stories to fetch (maximum 3)
 * @param featured Whether to fetch only featured stories
 * @returns Array of success stories
 */
export async function getSuccessStories(
  limit: number = 3,
  featured: boolean = true
): Promise<SuccessStory[]> {
  try {
    // Ensure limit is not more than 3
    const actualLimit = Math.min(limit, 3);

    const query: any = {
      where: {
        status: "APPROVED",
        isFeature: featured, // Default to fetching featured stories
      },
      select: {
        id: true,
        name: true,
        profession: true,
        story: true,
        achievement: true,
        course: true,
        imageUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: actualLimit,
    };

    const stories = await db.successStory.findMany(query);

    // Transform the stories to match the SuccessStory interface
    return stories.map((story) => ({
      id: story.id,
      name: story.name,
      profession: story.profession,
      story: story.story,
      achievement: story.achievement,
      course: story.course,
      imageUrl: story.imageUrl,
    }));
  } catch (error) {
    console.error("[GET_SUCCESS_STORIES_ACTION]", error);
    return [];
  }
}
