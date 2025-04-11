export type Question = {
  question: string;
  image: File | null;
  image_url: string;
};

export type Answer = {
  index: number;
  answer: string;
  image: File | null;
  image_url: string;
};

export type Explanation = {
  explanation_text: string;
  explanation_file: File | null;
  explanation_image: string;
};

export type QuestionStateType = {
  question: Question;
  answer: Answer[];
  currectAnswer: number;
  explanation: Explanation;
};

type Action =
  | { type: "UPDATE_QUESTION"; payload: Question }
  | { type: "UPDATE_ANSWER"; payload: Answer[] }
  | { type: "UPDATE_CORRECT_ANSWER"; payload: number }
  | { type: "UPDATE_EXPLANATION"; payload: Explanation }
  | { type: "RESET" };

export const initialQuestionState = {
  question: { question: "", image: null, image_url: "" },
  answer: [
    { index: 1, answer: "", image: null, image_url: "" },
    { index: 2, answer: "", image: null, image_url: "" },
  ],
  currectAnswer: 0,
  explanation: {
    explanation_text: "",
    explanation_file: null,
    explanation_image: "",
  },
};

export function reducerQuestion(state: QuestionStateType, action: Action) {
  switch (action.type) {
    case "UPDATE_QUESTION":
      return { ...state, question: action.payload };
    case "UPDATE_ANSWER":
      return { ...state, answer: action.payload };
    case "UPDATE_CORRECT_ANSWER":
      return { ...state, currectAnswer: action.payload };
    case "UPDATE_EXPLANATION":
      return { ...state, explanation: action.payload };
    case "RESET": {
      return initialQuestionState;
    }
    default:
      throw new Error();
  }
}
