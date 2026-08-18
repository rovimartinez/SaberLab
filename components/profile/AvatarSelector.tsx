'use client';

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const botttsAvatarOptions = [
    'https://api.dicebear.com/9.x/bottts/svg?seed=Casper', 'https://api.dicebear.com/9.x/bottts/svg?seed=Leo',
    'https://api.dicebear.com/9.x/bottts/svg?seed=Milo', 'https://api.dicebear.com/9.x/bottts/svg?seed=Oscar',
    'https://api.dicebear.com/9.x/bottts/svg?seed=Toby', 'https://api.dicebear.com/9.x/bottts/svg?seed=Loki',
    'https://api.dicebear.com/9.x/bottts/svg?seed=Gizmo', 'https://api.dicebear.com/9.x/bottts/svg?seed=Rusty',
    'https://api.dicebear.com/9.x/bottts/svg?seed=Bolt', 'https://api.dicebear.com/9.x/bottts/svg?seed=Clank',
    'https://api.dicebear.com/9.x/bottts/svg?seed=Digit', 'https://api.dicebear.com/9.x/bottts/svg?seed=Pixel',
];
const funEmojiAvatarOptions = [
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Abby', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Mimi',
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Max', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zoe',
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sammy', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jasmine',
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Charlie', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lucy',
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Peanut', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Bubbles',
    'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sunny', 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Daisy',
];
const adventurerAvatarOptions = [
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Roxy', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Coco',
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Rascal', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Simon',
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Tigger', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Trouble',
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Pepper', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Shadow',
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Smokey', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Bandit',
    'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Chester', 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Willow'
];
const avataaarsAvatarOptions = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Missy', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Annie', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Midnight',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Sheba', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Misty',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Sugar', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bear',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Patches', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maggie',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=George', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Tinkerbell',
];

interface AvatarSelectorProps {
    selectedAvatar: string | null;
    onSelectAvatar: (url: string) => void;
    googleAvatarUrl: string | null;
}

const AvatarGrid = ({ title, options, selectedAvatar, onSelectAvatar }: {
    title: string;
    options: string[];
    selectedAvatar: string | null;
    onSelectAvatar: (url: string) => void;
}) => (
    <div>
        <Label>{title}</Label>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-2">
            {options.map((avatarUrl, index) => (
                <button
                    key={`${title}-${index}`}
                    onClick={() => onSelectAvatar(avatarUrl)}
                    className={cn(
                        "rounded-full overflow-hidden border-4 transition-all bg-secondary p-1",
                        selectedAvatar === avatarUrl ? "border-primary scale-110" : "border-transparent hover:border-primary/50"
                    )}
                >
                    <img
                        src={avatarUrl}
                        alt={`Avatar ${index + 1}`}
                        width="64"
                        height="64"
                        className="w-full h-auto aspect-square object-cover rounded-full"
                    />
                </button>
            ))}
        </div>
    </div>
)

export function AvatarSelector({ selectedAvatar, onSelectAvatar, googleAvatarUrl }: AvatarSelectorProps) {
    return (
        <div className="space-y-4">
            {googleAvatarUrl && (
                <div>
                    <Label>Avatar de Google</Label>
                    <div className="mt-2">
                         <button
                            onClick={() => onSelectAvatar(googleAvatarUrl)}
                            className={cn(
                                "rounded-full overflow-hidden border-4 transition-all bg-secondary p-1",
                                selectedAvatar === googleAvatarUrl ? "border-primary scale-110" : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <img
                                src={googleAvatarUrl}
                                alt="Avatar de Google"
                                width="64"
                                height="64"
                                className="w-16 h-16 aspect-square object-cover rounded-full"
                            />
                        </button>
                    </div>
                </div>
            )}
            <AvatarGrid title="Robots" options={botttsAvatarOptions} selectedAvatar={selectedAvatar} onSelectAvatar={onSelectAvatar} />
            <AvatarGrid title="Emojis" options={funEmojiAvatarOptions} selectedAvatar={selectedAvatar} onSelectAvatar={onSelectAvatar} />
            <AvatarGrid title="Aventureros" options={adventurerAvatarOptions} selectedAvatar={selectedAvatar} onSelectAvatar={onSelectAvatar} />
            <AvatarGrid title="Avataars" options={avataaarsAvatarOptions} selectedAvatar={selectedAvatar} onSelectAvatar={onSelectAvatar} />
        </div>
    )
}
