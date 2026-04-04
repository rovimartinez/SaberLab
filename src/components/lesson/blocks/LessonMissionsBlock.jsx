import React from 'react';
import MisionRoadMap from '../../simulators/RE/MisionRoadMap';

const LessonMissionsBlock = ({ block, lessonKey }) => {
    return <MisionRoadMap missions={block.missions || []} lessonKey={lessonKey} />;
};

export default LessonMissionsBlock;
