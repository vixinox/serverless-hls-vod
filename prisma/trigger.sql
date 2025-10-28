-- 视频评论数更新触发函数
CREATE OR REPLACE FUNCTION trg_comment_update_videocount()
    RETURNS TRIGGER
    language plpgsql
    SET search_path = public
AS
$$
BEGIN
    -- 插入新评论时更新评论数
    IF TG_OP = 'INSERT' THEN
        IF new."deletedAt" IS NULL THEN
            UPDATE "Video"
            SET "commentsCount" = "commentsCount" + 1
            WHERE "id" = new."videoId";
        END IF;

        -- 更新评论的删除状态时，更新评论数
    ELSIF TG_OP = 'UPDATE' THEN
        IF old."deletedAt" IS NULL AND new."deletedAt" IS NOT NULL THEN
            UPDATE "Video"
            SET "commentsCount" = GREATEST("commentsCount" - 1, 0)
            WHERE "id" = new."videoId";
        ELSIF old."deletedAt" IS NOT NULL AND new."deletedAt" IS NULL THEN
            UPDATE "Video"
            SET "commentsCount" = "commentsCount" + 1
            WHERE "id" = new."videoId";
        END IF;

        -- 删除评论时更新评论数
    ELSIF TG_OP = 'DELETE' THEN
        IF old."deletedAt" IS NULL THEN
            UPDATE "Video"
            SET "commentsCount" = GREATEST("commentsCount" - 1, 0)
            WHERE "id" = old."videoId";
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 评论表触发器
CREATE OR REPLACE TRIGGER trg_comment_videocount
    AFTER INSERT OR UPDATE OR DELETE
    ON "Comment"
    FOR EACH ROW
EXECUTE FUNCTION trg_comment_update_videocount();

-- 回复数更新触发函数
CREATE OR REPLACE FUNCTION trg_reply_update_commentcount()
    RETURNS TRIGGER
    language plpgsql
    SET search_path = public
AS
$$
BEGIN
    -- 插入新回复时更新回复数
    IF TG_OP = 'INSERT' THEN
        IF new."deletedAt" IS NULL THEN
            UPDATE "Comment"
            SET "repliesCount" = "repliesCount" + 1
            WHERE "id" = new."commentId";
        END IF;

        -- 更新回复的删除状态时，更新回复数
    ELSIF TG_OP = 'UPDATE' THEN
        IF old."deletedAt" IS NULL AND new."deletedAt" IS NOT NULL THEN
            UPDATE "Comment"
            SET "repliesCount" = GREATEST("repliesCount" - 1, 0)
            WHERE "id" = new."commentId";
        ELSIF old."deletedAt" IS NOT NULL AND new."deletedAt" IS NULL THEN
            UPDATE "Comment"
            SET "repliesCount" = "repliesCount" + 1
            WHERE "id" = new."commentId";
        END IF;

        -- 删除回复时更新回复数
    ELSIF TG_OP = 'DELETE' THEN
        IF old."deletedAt" IS NULL THEN
            UPDATE "Comment"
            SET "repliesCount" = GREATEST("repliesCount" - 1, 0)
            WHERE "id" = old."commentId";
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 回复表触发器
CREATE OR REPLACE TRIGGER trg_reply_commentcount
    AFTER INSERT OR UPDATE OR DELETE
    ON "Reply"
    FOR EACH ROW
EXECUTE FUNCTION trg_reply_update_commentcount();

-- 通用 Reaction 更新触发函数
CREATE OR REPLACE FUNCTION trg_generic_reaction_update_counts()
    RETURNS TRIGGER
    language plpgsql
    SET search_path = public
AS
$$
BEGIN
    -- 根据表名和reaction类型更新 Video, Comment, Reply 的计数
    IF TG_TABLE_NAME = 'VideoReaction' THEN
        IF TG_OP = 'INSERT' THEN
            IF new."reactionType" = 'LIKE' THEN
                UPDATE "Video"
                SET "likesCount" = "likesCount" + 1
                WHERE "id" = new."videoId";
            ELSIF new."reactionType" = 'DISLIKE' THEN
                UPDATE "Video"
                SET "dislikesCount" = "dislikesCount" + 1
                WHERE "id" = new."videoId";
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF old."reactionType" = 'LIKE' THEN
                UPDATE "Video"
                SET "likesCount" = GREATEST("likesCount" - 1, 0)
                WHERE "id" = old."videoId";
            ELSIF old."reactionType" = 'DISLIKE' THEN
                UPDATE "Video"
                SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                WHERE "id" = old."videoId";
            END IF;
        ELSIF TG_OP = 'UPDATE' THEN
            IF old."reactionType" IS DISTINCT FROM new."reactionType" THEN
                IF old."reactionType" = 'LIKE' THEN
                    UPDATE "Video"
                    SET "likesCount" = GREATEST("likesCount" - 1, 0)
                    WHERE "id" = old."videoId";
                ELSIF old."reactionType" = 'DISLIKE' THEN
                    UPDATE "Video"
                    SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                    WHERE "id" = old."videoId";
                END IF;
                IF new."reactionType" = 'LIKE' THEN
                    UPDATE "Video"
                    SET "likesCount" = "likesCount" + 1
                    WHERE "id" = new."videoId";
                ELSIF new."reactionType" = 'DISLIKE' THEN
                    UPDATE "Video"
                    SET "dislikesCount" = "dislikesCount" + 1
                    WHERE "id" = new."videoId";
                END IF;
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'CommentReaction' THEN
        IF TG_OP = 'INSERT' THEN
            IF new."reactionType" = 'LIKE' THEN
                UPDATE "Comment"
                SET "likesCount" = "likesCount" + 1
                WHERE "id" = new."commentId";
            ELSIF new."reactionType" = 'DISLIKE' THEN
                UPDATE "Comment"
                SET "dislikesCount" = "dislikesCount" + 1
                WHERE "id" = new."commentId";
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF old."reactionType" = 'LIKE' THEN
                UPDATE "Comment"
                SET "likesCount" = GREATEST("likesCount" - 1, 0)
                WHERE "id" = old."commentId";
            ELSIF old."reactionType" = 'DISLIKE' THEN
                UPDATE "Comment"
                SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                WHERE "id" = old."commentId";
            END IF;
        ELSIF TG_OP = 'UPDATE' THEN
            IF old."reactionType" IS DISTINCT FROM new."reactionType" THEN
                IF old."reactionType" = 'LIKE' THEN
                    UPDATE "Comment"
                    SET "likesCount" = GREATEST("likesCount" - 1, 0)
                    WHERE "id" = old."commentId";
                ELSIF old."reactionType" = 'DISLIKE' THEN
                    UPDATE "Comment"
                    SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                    WHERE "id" = old."commentId";
                END IF;
                IF new."reactionType" = 'LIKE' THEN
                    UPDATE "Comment"
                    SET "likesCount" = "likesCount" + 1
                    WHERE "id" = new."commentId";
                ELSIF new."reactionType" = 'DISLIKE' THEN
                    UPDATE "Comment"
                    SET "dislikesCount" = "dislikesCount" + 1
                    WHERE "id" = new."commentId";
                END IF;
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'ReplyReaction' THEN
        IF TG_OP = 'INSERT' THEN
            IF new."reactionType" = 'LIKE' THEN
                UPDATE "Reply"
                SET "likesCount" = "likesCount" + 1
                WHERE "id" = new."replyId";
            ELSIF new."reactionType" = 'DISLIKE' THEN
                UPDATE "Reply"
                SET "dislikesCount" = "dislikesCount" + 1
                WHERE "id" = new."replyId";
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF old."reactionType" = 'LIKE' THEN
                UPDATE "Reply"
                SET "likesCount" = GREATEST("likesCount" - 1, 0)
                WHERE "id" = old."replyId";
            ELSIF old."reactionType" = 'DISLIKE' THEN
                UPDATE "Reply"
                SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                WHERE "id" = old."replyId";
            END IF;
        ELSIF TG_OP = 'UPDATE' THEN
            IF old."reactionType" IS DISTINCT FROM new."reactionType" THEN
                IF old."reactionType" = 'LIKE' THEN
                    UPDATE "Reply"
                    SET "likesCount" = GREATEST("likesCount" - 1, 0)
                    WHERE "id" = old."replyId";
                ELSIF old."reactionType" = 'DISLIKE' THEN
                    UPDATE "Reply"
                    SET "dislikesCount" = GREATEST("dislikesCount" - 1, 0)
                    WHERE "id" = old."replyId";
                END IF;
                IF new."reactionType" = 'LIKE' THEN
                    UPDATE "Reply"
                    SET "likesCount" = "likesCount" + 1
                    WHERE "id" = new."replyId";
                ELSIF new."reactionType" = 'DISLIKE' THEN
                    UPDATE "Reply"
                    SET "dislikesCount" = "dislikesCount" + 1
                    WHERE "id" = new."replyId";
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Reaction 表触发器
CREATE OR REPLACE TRIGGER trg_reaction_counts_video
    AFTER INSERT OR DELETE OR UPDATE
    ON "VideoReaction"
    FOR EACH ROW
EXECUTE FUNCTION trg_generic_reaction_update_counts();

CREATE OR REPLACE TRIGGER trg_reaction_counts_comment
    AFTER INSERT OR DELETE OR UPDATE
    ON "CommentReaction"
    FOR EACH ROW
EXECUTE FUNCTION trg_generic_reaction_update_counts();

CREATE OR REPLACE TRIGGER trg_reaction_counts_reply
    AFTER INSERT OR DELETE OR UPDATE
    ON "ReplyReaction"
    FOR EACH ROW
EXECUTE FUNCTION trg_generic_reaction_update_counts();