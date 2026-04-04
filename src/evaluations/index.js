export const EVALUATIONS_MAP = {
    RE: {
        m1: {
            e1: () => import('./RE/m1/module1Evaluation').then((m) => m.module1EvaluationData)
        }
    }
};

export const getEvaluationData = async (courseAbbr, moduleId, evaluationId) => {
    const course = EVALUATIONS_MAP[courseAbbr];
    const module = course?.[moduleId];
    const loader = module?.[evaluationId];

    if (!loader) return null;

    return loader();
};
