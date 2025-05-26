import { Button } from "@chakra-ui/react";
import { nanoid } from "@reduxjs/toolkit";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch } from "@/lib/create-store";
import { unlikeMessage } from "@/lib/timelines/usecases/unlike-message.usecase";
import { likeMessage } from "@/lib/timelines/usecases/like-message.usecase";
import { createLikeButtonViewModel } from "./like-button.viewmodel";

const generateLikeId = () => nanoid();

export const LikeButton = ({ messageId }: { messageId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const viewModel = useSelector(createLikeButtonViewModel({ messageId }));
  const alreadyLikedIt = !!viewModel.authUserLike;

  const handleClickHeartEvent = () => {
    const likeId = viewModel.authUserLike
      ? viewModel.authUserLike.id
      : generateLikeId();

    if (viewModel.authUserLike) {
      return dispatch(unlikeMessage({ likeId, messageId }));
    }
    return dispatch(likeMessage({ likeId, messageId }));
  };

  return (
    <Button
      leftIcon={alreadyLikedIt ? <AiFillHeart /> : <AiOutlineHeart />}
      colorScheme="pink"
      variant="ghost"
      onClick={handleClickHeartEvent}
      m={0}
      maxWidth={20}
    >
      {viewModel.likesCount}
    </Button>
  );
};
