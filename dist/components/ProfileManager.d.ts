import React from 'react';
import { Profile } from '../types.js';
interface ProfileManagerProps {
    onSelectProfile: (profile: Profile | null) => void;
    onBack: () => void;
    onError: (error: string) => void;
}
export declare const ProfileManager: React.FC<ProfileManagerProps>;
export {};
//# sourceMappingURL=ProfileManager.d.ts.map