import useSWRInfinite from 'swr/infinite';
import { useSession } from 'next-auth/react';
import { submitComment } from "@/actions/comment/submit-comment";
import { deleteComment } from "@/actions/comment/delete-comment";
import { editComment } from "@/actions/comment/edit-comment";
import { CommentData, getComments, NextCursor } from '@/actions/comment/get-comments';
import { ReactionType } from "@/../prisma/generated/prisma/client";
import { putCommentReaction } from "@/actions/reaction/put-comment-reaction";
import { redirect } from "next/navigation";
import { submitReply } from "@/actions/comment/submit-reply";

type PageData = {
  comments: CommentData[];
  nextCursor: NextCursor;
  commentsCount: number;
};

export function useComments(
  shortCode: string,
  order: 'POPULAR' | 'LATEST',
  limit: number = 20
) {
  const { data: session } = useSession();

  const getKey = (
    pageIndex: number,
    previousPageData: { comments: CommentData[], nextCursor: NextCursor, commentsCount: number } | null
  ) => {
    if (pageIndex === 0) return ['comments', shortCode, order, limit];
    if (!previousPageData) return null;
    if (!previousPageData.nextCursor) return null;
    return ['comments', shortCode, order, limit, previousPageData.nextCursor];
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<PageData>(
      getKey,
      async ([_, shortCode, order, limit, cursor]) => {
        return await getComments(
          shortCode as string,
          order as 'POPULAR' | 'LATEST',
          limit as number,
          cursor as NextCursor
        );
      },
      {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
      }
    );

  const comments = data ? data.flatMap((page) => page.comments) : [];
  const commentsCount = data?.[0]?.commentsCount ?? 0;
  const hasMore = data ? !!data[data.length - 1]?.nextCursor : false;

  const addComment = async (text: string) => {
    if (!session?.user?.id) redirect('/auth/sign-in');
    const optimisticComment: CommentData = {
      commentId: `optimistic-${Date.now()}`,
      userId: session.user.id,
      content: text,
      createdAt: new Date(),
      image: session.user.image ?? undefined,
      name: session.user.name ?? 'User',
      likesCount: 0,
      repliesCount: 0,
      prevReaction: undefined,
    };

    await mutate(
      (cachedData) => {
        if (!cachedData) {
          return [{ comments: [optimisticComment], nextCursor: null, commentsCount: 1 }];
        }

        const newData = [...cachedData];
        newData[0] = {
          ...newData[0],
          comments: [optimisticComment, ...newData[0].comments],
          commentsCount: (newData[0].commentsCount ?? 0) + 1,
        };
        return newData;
      },
      { revalidate: false }
    );

    try {
      await submitComment(shortCode, text);
      await mutate();
    } catch (e) {
      await mutate();
      throw e;
    }
  };

  const removeComment = async (commentId: string) => {
    const optimisticData = data?.map((page) => ({
      ...page,
      comments: page.comments.filter((c) => c.commentId !== commentId),
      commentsCount: Math.max(0, (page.commentsCount ?? 0) - 1),
    }));

    await mutate(optimisticData, { revalidate: false });

    try {
      await deleteComment(commentId, 'comment');
      await mutate();
    } catch (e) {
      await mutate();
      throw e;
    }
  };

  const updateComment = async (commentId: string, newContent: string) => {
    const optimisticData = data?.map((page) => ({
      ...page,
      comments: page.comments.map((c) =>
        c.commentId === commentId ? { ...c, content: newContent } : c
      ),
    }));

    await mutate(optimisticData, { revalidate: false });

    try {
      await editComment(commentId, newContent, 'comment');
      await mutate();
    } catch (e) {
      await mutate();
      throw e;
    }
  };

  const toggleReaction = async (commentId: string, reactionType?: ReactionType) => {
    const optimisticData = data?.map((page) => ({
      ...page,
      comments: page.comments.map((c) => {
        if (c.commentId !== commentId) return c;

        const prev = c.prevReaction;
        let likeDelta = 0;

        if (prev !== 'LIKE' && reactionType === 'LIKE') {
          likeDelta = 1;
        } else if (prev === 'LIKE' && reactionType !== 'LIKE') {
        }

        return {
          ...c,
          likesCount: Math.max(0, c.likesCount + likeDelta),
          prevReaction: reactionType,
        };
      }),
    }));

    await mutate(optimisticData, { revalidate: false });

    try {
      await putCommentReaction(commentId, reactionType);
    } catch (err) {
      await mutate(data, { revalidate: false });
      throw err;
    }
  };

  const addReply = async (commentId: string, text: string) => {
    if (!session?.user?.id) redirect('/auth/sign-in');

    await mutate((cachedData) => {
      if (!cachedData) return cachedData;
      return cachedData.map((page) => ({
        ...page,
        comments: page.comments.map((c) =>
          c.commentId === commentId
            ? { ...c, repliesCount: (c.repliesCount ?? 0) + 1 }
            : c
        ),
      }));
    }, { revalidate: false });

    try {
      await submitReply(commentId, text);
      await mutate();
    } catch (e) {
      await mutate();
      throw e;
    }
  };

  return {
    comments,
    commentsCount,
    isLoading,
    isLoadingMore: isValidating && size > 0,
    hasMore,
    loadMore: () => setSize(size + 1),
    error,
    addComment,
    addReply,
    removeComment,
    updateComment,
    toggleReaction,
    mutate,
  };
}