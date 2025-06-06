import React from 'react';
import { Template, ModelStatus } from '../types.js';
interface TemplateManagerProps {
    onSelectTemplate: (template: Template | null) => void;
    onLoadTemplate: (models: ModelStatus[]) => void;
    onBack: () => void;
    onError: (error: string) => void;
}
export declare const TemplateManager: React.FC<TemplateManagerProps>;
export {};
//# sourceMappingURL=TemplateManager.d.ts.map