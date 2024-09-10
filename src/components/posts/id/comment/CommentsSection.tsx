'use client';

import React from 'react';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import {
  useAddCommentMutation,
  useGetCommentsQuery,
} from '@/lib/features/comments/comment.slice';
import { useSession } from 'next-auth/react';

export default function CommentsSection({ postId }: { postId: string }) {
  const session = useSession();
  const [addComment] = useAddCommentMutation();
  const { isLoading, data: comments } = useGetCommentsQuery(postId);

  if(isLoading) {
    return <div>Loading</div>
  }

  return (
    <section className="mt-5">
      <span className=" font-bold">
        {comments && `${comments.length} Comments`} 
      </span>
      {session.status === 'loading' ? (
        <div>Loading...</div>
      ) : session.data?.user ? (
        <CommentForm
          className="mt-5"
          handleSubmit={async (value) => {
            return addComment({ content: value, postId: postId });
          }}
        />
      ) : (
        <div>You can not leave comment before signing in</div>
      )}

      {comments && <CommentsList postId={postId} comments={comments} />}
    </section>
  );
}
