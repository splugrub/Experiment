type Language = 'bash' | 'pS' | 'pSforeach' | 'bmap' | 'pSreader' | 'py';
export declare class ScriptGenerator {
    private treatment;
    private withError;
    private scriptLines;
    private correctScript;
    private errorPreview;
    private errorPosition;
    private errorSection;
    errorNote: string;
    language: string;
    constructor(treatment: Language, withError: boolean);
    getCorrectAnswer(): "1" | "e";
    getErrorSection(): string;
    private getRandomNumber;
    generatePreview(): string;
    generateErrorPreview(): string;
    generateScript(): string;
    getErrorPosition(): string;
    private getBashScriptWithCondition;
    private getPowerShellScript;
    private getPowerShellForEachElement;
    private getBashForLoopMapfile;
    private getPowershellNetClassStreamReader;
    private getPythonLoop;
    private highlightRed;
    createErrorPosition(): void;
}
export {};
