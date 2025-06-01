type Language = 'Bash' | 'PowerShell' | 'Python';
export declare class ConditionScriptGenerator {
    private language;
    private withError;
    private scriptLines;
    private correctScript;
    private errorPosition;
    private errorSection;
    private maxErrorPosition;
    errorNote: string;
    constructor(language: Language, withError: boolean);
    getCorrectAnswer(): "1" | "e";
    getMaxErrorPosition(): string;
    getErrorSection(): string;
    private getRandomNumber;
    generatePreview(): string;
    generateScript(): string;
    getErrorPosition(): string;
    private getBashScript;
    private getPowershellScript;
    private getPythonCode;
    createErrorPosition(): void;
}
export {};
