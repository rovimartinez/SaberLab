const TAB_ORDER = ['contenido', 'repaso', 'simulador', 'prueba'];

const withBlockDefaults = (tabId, block, index) => ({
    id: block.id || `${tabId}-${block.type || 'block'}-${index + 1}`,
    ...block
});

const buildBlocksByTabFromLegacy = ({ lesson, lessonKey, missions = [] }) => {
    const blocksByTab = {
        contenido: [
            createContentBlock({
                id: `${lessonKey}-content`,
                content: lesson.content,
                challenges: lesson.challenges,
                hasSimulator: lesson.hasSimulator
            })
        ]
    };

    if (Array.isArray(lesson.flashcards) && lesson.flashcards.length > 0) {
        blocksByTab.repaso = [
            createFlashcardsBlock({
                id: `${lessonKey}-review`,
                flashcards: lesson.flashcards,
                lessonContent: lesson.content
            })
        ];
    }

    if (Array.isArray(missions) && missions.length > 0) {
        blocksByTab.simulador = [
            createMissionsBlock({
                id: `${lessonKey}-missions`,
                missions
            })
        ];
    }

    if (Array.isArray(lesson.questions) && lesson.questions.length > 0) {
        blocksByTab.prueba = [
            createQuizBlock({
                id: `${lessonKey}-quiz`,
                title: lesson.title,
                questions: lesson.questions,
                quizConfig: lesson.quizConfig || {}
            })
        ];
    }

    return blocksByTab;
};

const normalizeExplicitBlocksByTab = (blocksByTab = {}) =>
    Object.fromEntries(
        Object.entries(blocksByTab)
            .filter(([, blocks]) => Array.isArray(blocks) && blocks.length > 0)
            .sort(([tabA], [tabB]) => TAB_ORDER.indexOf(tabA) - TAB_ORDER.indexOf(tabB))
            .map(([tabId, blocks]) => [tabId, blocks.map((block, index) => withBlockDefaults(tabId, block, index))])
    );

const getFirstBlockOfType = (blocksByTab, type) =>
    Object.values(blocksByTab)
        .flat()
        .find((block) => block.type === type);

const buildLegacyFieldsFromBlocks = (blocksByTab) => {
    const contentBlock = getFirstBlockOfType(blocksByTab, 'content');
    const flashcardsBlock = getFirstBlockOfType(blocksByTab, 'flashcards');
    const quizBlock = getFirstBlockOfType(blocksByTab, 'quiz');
    const missionsBlock = getFirstBlockOfType(blocksByTab, 'missions');

    return {
        content: contentBlock?.content ?? '',
        challenges: contentBlock?.challenges ?? [],
        hasSimulator: contentBlock?.hasSimulator ?? false,
        flashcards: flashcardsBlock?.flashcards ?? [],
        questions: quizBlock?.questions ?? [],
        quizConfig: quizBlock?.quizConfig ?? {},
        missions: missionsBlock?.missions ?? []
    };
};

const injectRuntimeMissions = ({ blocksByTab, lessonKey, missions = [] }) => {
    if (!Array.isArray(missions) || missions.length === 0) return blocksByTab;
    if (Array.isArray(blocksByTab.simulador) && blocksByTab.simulador.length > 0) return blocksByTab;

    return {
        ...blocksByTab,
        simulador: [
            createMissionsBlock({
                id: `${lessonKey}-missions`,
                missions
            })
        ]
    };
};

export const createContentBlock = ({
    id,
    content = '',
    challenges = [],
    hasSimulator = false
} = {}) => ({
    id,
    type: 'content',
    content,
    challenges,
    hasSimulator
});

export const createFlashcardsBlock = ({
    id,
    flashcards = [],
    lessonContent = ''
} = {}) => ({
    id,
    type: 'flashcards',
    flashcards,
    lessonContent
});

export const createQuizBlock = ({
    id,
    title = '',
    questions = [],
    quizConfig = {}
} = {}) => ({
    id,
    type: 'quiz',
    title,
    questions,
    quizConfig
});

export const createMissionsBlock = ({
    id,
    missions = []
} = {}) => ({
    id,
    type: 'missions',
    missions
});

export const defineLesson = ({ blocksByTab = {}, ...lesson }) => {
    const normalizedBlocksByTab = normalizeExplicitBlocksByTab(blocksByTab);

    return {
        ...lesson,
        ...buildLegacyFieldsFromBlocks(normalizedBlocksByTab),
        blocksByTab: normalizedBlocksByTab
    };
};

export const normalizeLessonData = ({ lesson, lessonKey, missions = [] }) => {
    if (!lesson) {
        return {
            title: 'Leccion',
            lessonKey,
            blocksByTab: {}
        };
    }

    const explicitBlocksByTab = normalizeExplicitBlocksByTab(lesson.blocksByTab || {});
    const baseBlocksByTab = Object.keys(explicitBlocksByTab).length > 0
        ? explicitBlocksByTab
        : buildBlocksByTabFromLegacy({ lesson, lessonKey, missions });
    const blocksByTab = injectRuntimeMissions({ blocksByTab: baseBlocksByTab, lessonKey, missions });

    return {
        ...lesson,
        ...buildLegacyFieldsFromBlocks(blocksByTab),
        lessonKey,
        blocksByTab
    };
};
