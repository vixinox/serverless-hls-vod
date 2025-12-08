// hooks/use-replies.ts
import useSWRInfinite from 'swr/infinite';
import { getReplies, ReplyCursor, ReplyData } from "@/actions/comment/get-replies";
import { useSession } from 'next-auth/react';
import { submitReply } from '@/actions/comment/submit-reply';
import { deleteComment } from '@/actions/comment/delete-comment';
import { editComment } from '@/actions/comment/edit-comment';
import { ReactionType } from "@/../prisma/generated/prisma/client";
import { putReplyReaction } from "@/actions/reaction/put-reply-reaction";
import { redirect } from "next/navigation";

type RepliesPage = {
  replies: ReplyData[];
  nextCursor: ReplyCursor;
};

export function useReplies(commentId: string, enabled: boolean = true) {
  const { data: session } = useSession();

  const getKey = (
    pageIndex: number,
    previousPageData: RepliesPage | null
  ) => {
    if (!enabled) return null;

    if (pageIndex === 0) return ['replies', commentId];
    if (!previousPageData) return null;
    if (!previousPageData.nextCursor) return null;
    return ['replies', commentId, previousPageData.nextCursor];
  };

  const fetcher = async ([_, cId, cursor]: [string, string, ReplyCursor?]) => {
    return await getReplies(cId, cursor);
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<RepliesPage>(
      getKey,
      fetcher,
      {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
      }
    );

  const replies = data ? data.flatMap(page => page.replies) : [];
  const hasMore = data ? data[data.length - 1]?.nextCursor !== null : false;

  const addReply = async (text: string) => {
    if (!session?.user?.id) redirect('/auth/sign-in');
    const optimisticReply: ReplyData = {
      parentId: commentId,
      replyId: `optimistic-${Date.now()}`,
      userId: session.user.id,
      content: text,
      createdAt: new Date(),
      image: session.user.image ?? undefined,
      name: session.user.name ?? 'User',
      likesCount: 0,
      prevReaction: undefined,
    };
    await mutate((cachedData) => {
      if (!cachedData) {
        return [{ replies: [optimisticReply], nextCursor: null }];
      }
      const newData = [...cachedData];
      newData[0] = {
        ...newData[0],
        replies: [optimisticReply, ...newData[0].replies],
      };
      return newData;
    }, { revalidate: false });
    try {
      await submitReply(commentId, text);
      await mutate();
    } catch (err) {
      await mutate();
      throw err;
    }
  };

  const removeReply = async (replyId: string) => {
    const optimisticData = data?.map(page => ({
      ...page,
      replies: page.replies.filter(r => r.replyId !== replyId),
    }));
    await mutate(optimisticData, { revalidate: false });
    try {
      await deleteComment(replyId, 'reply');
      await mutate();
    } catch (err) {
      await mutate();
      throw err;
    }
  };

  const updateReply = async (replyId: string, newContent: string) => {
    const optimisticData = data?.map(page => ({
      ...page,
      replies: page.replies.map(r =>
        r.replyId === replyId ? { ...r, content: newContent } : r
      ),
    }));
    await mutate(optimisticData, { revalidate: false });
    try {
      await editComment(replyId, newContent, 'reply');
      await mutate();
    } catch (err) {
      await mutate();
      throw err;
    }
  };

  const toggleReaction = async (replyId: string, reactionType?: ReactionType) => {
    const optimisticData = data?.map((page) => ({
      ...page,
      replies: page.replies.map((r) => {
        if (r.replyId !== replyId) return r;
        const prev = r.prevReaction;
        let likeDelta = 0;
        if (prev !== 'LIKE' && reactionType === 'LIKE') {
          likeDelta = 1;
        } else if (prev === 'LIKE' && reactionType !== 'LIKE') {
          likeDelta = -1;
        }
        return {
          ...r,
          likesCount: Math.max(0, r.likesCount + likeDelta),
          prevReaction: reactionType,
        };
      }),
    }));
    await mutate(optimisticData, { revalidate: false });
    try {
      await putReplyReaction(replyId, reactionType);
    } catch (e) {
      await mutate(data, { revalidate: false });
      throw e;
    }
  };

  return {
    replies,
    isLoading,
    isLoadingMore: isValidating && size > 0,
    hasMore,
    loadMore: () => setSize(size + 1),
    mutate,
    error,
    addReply,
    removeReply,
    updateReply,
    toggleReaction,
  };
}