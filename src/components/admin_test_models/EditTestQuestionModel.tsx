import React, { Dispatch, SetStateAction } from "react";
import TestModel from "./TestModel";
import EditQuestion from "../admin_dashboard/EditQuestion";

interface AddTestModelProps {
  isAddOpen: boolean;
  courseId: string;
  chapterId: string;
  lessonId: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  currentQuestion: any;
}

export default function EditTestQuestionModel({
  isAddOpen,
  courseId,
  chapterId,
  lessonId,
  setIsOpen,
  currentQuestion,
}: AddTestModelProps) {
  return (
    <TestModel isOpen={isAddOpen}>
      <EditQuestion
        courseId={courseId}
        chapterId={chapterId}
        lessonId={lessonId}
        currentQuestion={currentQuestion}
        setIsOpen={setIsOpen}
      />
    </TestModel>
  );
}
