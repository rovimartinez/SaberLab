import React from 'react';
import LessonContentBlock from './blocks/LessonContentBlock';
import LessonFlashcardsBlock from './blocks/LessonFlashcardsBlock';
import LessonMissionsBlock from './blocks/LessonMissionsBlock';
import LessonQuizBlock from './blocks/LessonQuizBlock';

const DEFAULT_RENDERERS = {
    content: LessonContentBlock,
    flashcards: LessonFlashcardsBlock,
    missions: LessonMissionsBlock,
    quiz: LessonQuizBlock
};

const LessonRenderer = ({ blocks = [], renderers = {}, context = {} }) => {
    if (!blocks.length) return null;

    return (
        <>
            {blocks.map((block) => {
                const customRenderer = renderers[block.type];

                if (typeof customRenderer === 'function') {
                    return (
                        <React.Fragment key={block.id}>
                            {customRenderer(block, context)}
                        </React.Fragment>
                    );
                }

                // Soporte nativo para bloques tipo 'custom': renderiza block.component directamente
                if (block.type === 'custom' && block.component) {
                    const CustomComponent = block.component;
                    return (
                        <React.Fragment key={block.id}>
                            <CustomComponent block={block} {...context} />
                        </React.Fragment>
                    );
                }

                const Renderer = DEFAULT_RENDERERS[block.type];
                if (!Renderer) return null;

                return <Renderer key={block.id} block={block} {...context} />;
            })}
        </>
    );
};

export default LessonRenderer;

