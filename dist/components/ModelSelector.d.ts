import React from 'react';
import { ModelStatus } from '../types.js';
interface ModelSelectorProps {
    onModelsSelected: (models: ModelStatus[]) => void;
    onBack: () => void;
    onError: (error: string) => void;
}
export declare const ModelSelector: React.FC<ModelSelectorProps>;
export {};
//# sourceMappingURL=ModelSelector.d.ts.map