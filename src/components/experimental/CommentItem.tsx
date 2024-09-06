'use client';

import { Comment as TComment } from '@prisma/client';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import {
  CommentContext,
  CommentItemProps,
  CommentWithRelations,
} from './types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import {
  createReplyOnComment,
  deleteComment,
} from '@/lib/actions/comment.actions';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquareText,
  EllipsisVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import CommentForm from './CommentForm';
import { useToastContext } from '@/contexts/toast.context';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { setCursorToEnd } from '@/lib/utils';
import {
  CommentAnswers,
  CommentAnswersContent,
  CommentAnswersTrigger,
} from './Answers';

const commentContext = createContext<CommentContext | null>(null);

function CommentProvider({ children }: { children: ReactNode }) {
  const [replyMode, setReplyMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <commentContext.Provider
      value={{ replyMode, setReplyMode, editMode, setEditMode }}
    >
      {children}
    </commentContext.Provider>
  );
}

function useCommentContext() {
  const context = useContext(commentContext);
  if (!context)
    throw new Error(
      'useContext(commentContext) should be used in CommentContextProvider'
    );
  return context;
}

function Comment({ children }: { children: ReactNode }) {
  return (
    <CommentProvider>
      <div>{children}</div>
    </CommentProvider>
  );
}
// Context ends

function CommentContent({ content }: { content: string }) {
  const { editMode } = useCommentContext();
  const [value, setValue] = useState(content);
  return editMode ? (
    <textarea
      rows={1}
      className="resize-none overflow-hidden text-muted-foreground outline-none comment-placeholder border-b-2 border-slate-600 focus:border-blue-500"
      autoFocus={true}
      onChange={(e) => setValue(e.target.value)}
      value={value}
      onFocus={(e) => setCursorToEnd(e.target)}
    />
  ) : (
    <p>{content}</p>
  );
}

function CommentOptions({ commentId }: { commentId: string }) {
  const toast = useToastContext();
  const { setEditMode, editMode } = useCommentContext();
  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDelete = async () => {
    const result = await deleteComment(commentId);
    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong with reactions.',
        description: result.error,
      });
    }
  };
  return (
    !editMode && (
      <DropdownMenu>
        <DropdownMenuTrigger className="my-auto">
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
}

const CommentFeedbackButtons = ({ comment }: { comment: TComment }) => {
  const [userReaction, setUserReaction] = useState<'none' | 'like' | 'dislike'>(
    'none'
  );
  const [likes, setLikes] = useState(comment.likes);
  const [disLikes, setDisLikes] = useState(comment.disLikes);
  const { setReplyMode, editMode } = useCommentContext();
  const handleLike = async () => {
    if (userReaction === 'like') return;

    if (userReaction === 'dislike') {
      setDisLikes((prev) => prev - 1);
      //   await disLikeComment(comment.id, 'decrement');
    }

    setLikes((prev) => prev + 1);
    setUserReaction('like');
    // const result = await likeComment(comment.id, 'increment');
    // if (result?.error) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Uh oh! Something went wrong with reactions.',
    //     description: result.error,
    //   });
    // }
  };

  const handleDisLike = async () => {
    if (userReaction === 'dislike') return;

    if (userReaction === 'like') {
      setLikes((prev) => prev - 1);
      //   await likeComment(comment.id, 'decrement');
    }

    setDisLikes((prev) => prev + 1);
    setUserReaction('dislike');
    // const result = await disLikeComment(comment.id, 'increment');
    // if (result?.error) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Uh oh! Something went wrong with reactions.',
    //     description: result.error,
    //   });
    // }
  };

  return (
    !editMode && (
      <div className="flex items-center">
        <Button
          variant={userReaction === 'like' ? 'secondary' : 'ghost'}
          onClick={handleLike}
        >
          <ThumbsUp className="size-4" />
          <span className="ml-2 text-sm text-muted-foreground">{likes}</span>
        </Button>
        <Button
          variant={userReaction === 'dislike' ? 'secondary' : 'ghost'}
          onClick={handleDisLike}
        >
          <ThumbsDown className="size-4" />
          <span className="ml-2 text-sm text-muted-foreground">{disLikes}</span>
        </Button>
        <Button variant="ghost" onClick={() => setReplyMode(true)}>
          {/* onClick={() => setIsReplying(true)} */}
          <span className="max-sm:hidden">Answer</span>
          <MessageSquareText className="hidden max-sm:block size-5" />
        </Button>
      </div>
    )
  );
};

function ReplyForm({ parentId, postId }: { parentId: string; postId: string }) {
  const { replyMode, setReplyMode } = useCommentContext();

  return (
    replyMode && (
      <CommentForm
        handleCancel={() => setReplyMode(false)}
        autoFocus={true}
        handlePost={(value) => createReplyOnComment(parentId, postId, value)}
      />
    )
  );
}

function EditModeActions() {
  const { setEditMode, editMode } = useCommentContext();
  return (
    editMode && (
      <div>
        <Button
          className="ml-auto"
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditMode(false);
          }}
        >
          <span>Cancel</span>
        </Button>
        <Button
          className="mx-1"
          size="sm"
          onClick={() => {
            setEditMode(false);
          }}
        >
          <span>Save</span>
        </Button>
      </div>
    )
  );
}

export default function CommentItem({ comment, postId }: any) {
    console.log(comment)
  return (
    <Comment>
      <div className="flex gap-4 items-start w-full">
        <Avatar>
          <AvatarImage src={comment.author?.image || undefined} />
          <AvatarFallback>BC</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <CommentContent content={comment.content} />
          <div className="flex mt-2">
            <CommentFeedbackButtons comment={comment} />
            <EditModeActions />
          </div>
        </div>
        <div>
          <CommentOptions commentId={comment.id} />
        </div>
      </div>
      <ReplyForm parentId={comment.id} postId={postId} />
      {comment.replies.length > 0 && (
        <CommentAnswers>
          <CommentAnswersTrigger>
            {comment.replies.length} Answers
          </CommentAnswersTrigger>
          <CommentAnswersContent>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </CommentAnswersContent>
        </CommentAnswers>
      )}
      {/* {comment.replies.length > 0 &&
        comment.replies.map((comment) => <CommentItem key={comment.id} comment={comment} />)} */}
    </Comment>
  );
}
