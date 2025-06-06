import React from 'react';
import { Profile, Template } from '../types.js';
interface MainMenuProps {
    currentProfile?: Profile;
    currentTemplate?: Template;
    onSelectView: (view: string) => void;
    onError: (error: string) => void;
}
export declare const MainMenu: React.FC<MainMenuProps>;
export {};
//# sourceMappingURL=MainMenu.d.ts.map