import { QuestionResultRow } from '@/components/design/QuestionResultRow';
import { AttemptAnswer } from '@/types';

interface QuestionTableProps {
    attempt_answers: AttemptAnswer[];
}

const AttemptAnswerComponent = ({ attempt_answers }: QuestionTableProps) => {
    return (
        <div className="space-y-3">
            {attempt_answers?.map((item, index) => (
                <QuestionResultRow
                    key={item.id || index}
                    index={index + 1}
                    question={item.question?.textarea ?? ''}
                    answer={item}
                    defaultExpanded={index === 0}
                />
            ))}
        </div>
    );
};

export default AttemptAnswerComponent;
