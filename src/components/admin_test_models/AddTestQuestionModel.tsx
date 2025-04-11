import React, { Dispatch, SetStateAction } from "react";
import TestModel from "./TestModel";
import AddQuestion from "../admin_dashboard/AddQuestion";

interface AddTestModelProps {
  isAddOpen: boolean;
  courseId: string;
  chapterId: string;
  lessonId: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddTestQuestionModel({
  isAddOpen,
  courseId,
  chapterId,
  lessonId,
  setIsOpen,
}: AddTestModelProps) {
  return (
    <TestModel isOpen={isAddOpen}>
      <AddQuestion
        courseId={courseId}
        chapterId={chapterId}
        lessonId={lessonId}
        setIsOpen={setIsOpen}
      />
    </TestModel>
  );
}
