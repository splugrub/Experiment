export class ConditionScriptGenerator {
    constructor(language, withError) {
        this.scriptLines = [];
        this.correctScript = [];
        this.errorPreview = [];
        this.errorPosition = 0;
        this.errorSection = 0;
        this.maxErrorPosition = 0;
        this.language = language;
        this.withError = withError;
        this.scriptLines = [];
        if (this.language === 'Bash') {
            this.scriptLines = this.getBashScript();
        }
        else if (this.language === 'PowerShell') {
            this.scriptLines = this.getPowershellScript();
        }
        else if (this.language === 'Python') {
            this.scriptLines = this.getPythonCode();
        }
        else {
            throw new Error(`Language: ${this.language} not supported.`);
        }
        this.correctScript = [...this.scriptLines];
        this.errorPreview = [...this.scriptLines];
        this.maxErrorPosition = 0;
        if (this.withError === true) {
            if (this.language === 'Bash') {
                this.maxErrorPosition = 16;
                this.errorPosition = this.getRandomNumber(this.maxErrorPosition);
            }
            else if (this.language === 'PowerShell') {
                this.maxErrorPosition = 8;
                this.errorPosition = this.getRandomNumber(this.maxErrorPosition);
            }
            else if (this.language === 'Python') {
                this.maxErrorPosition = 8;
                this.errorPosition = this.getRandomNumber(this.maxErrorPosition);
            }
            // Calculate errorSection (1 to 5)
            this.errorSection = Math.ceil(this.errorPosition / (this.maxErrorPosition / 4));
            if (this.errorSection > 4)
                this.errorSection = 4; // Clamp to 5
            this.createErrorPosition();
        }
        else {
            this.errorPosition = 99;
            this.errorSection = 5;
        }
    }
    getCorrectAnswer() {
        if (this.withError) {
            return "e";
        }
        else {
            return "1";
        }
    }
    getMaxErrorPosition() {
        return this.maxErrorPosition.toString();
    }
    getErrorSection() {
        return this.errorSection.toString();
    }
    getRandomNumber(upperLimit) {
        if (upperLimit <= 0) {
            throw new Error('Upper limit must be greater than 0.');
        }
        return Math.floor(Math.random() * upperLimit) + 1;
    }
    generatePreview() {
        let result = this.correctScript.join('\n');
        let htmlString = result.replace(/\n/g, '<br>');
        return "<div class='sourcecode'>" + htmlString + "</div>";
    }
    generateErrorPreview() {
        let result = this.errorPreview.join('\n');
        let htmlString = result.replace(/\n/g, '<br>');
        return "<div class='sourcecode'>" + htmlString + "</div>";
    }
    generateScript() {
        let result = this.scriptLines.join('\n');
        let htmlString = result.replace(/\n/g, '<br>');
        return "<div class='sourcecode'>" + htmlString + "</div>";
    }
    getErrorPosition() {
        return this.errorPosition.toString();
    }
    getBashScript() {
        return [
            'if [[ "$name" == "Max" && $age -ge 18 ]]; then',
            '&nbsp # Condition body',
            'fi',
        ];
    }
    getPowershellScript() {
        return [
            'if ($name -eq "Max" -and $age -ge 18) {',
            '&nbsp # Condition body',
            '}',
        ];
    }
    getPythonCode() {
        return [
            'if name == "Max" and age >= 18:',
            '&nbsp # Condition body',
        ];
    }
    highlightRed(input) {
        return input.replace(/\*(.*?)\*/g, (_match, p1) => {
            return `<span style="color: red;">${p1}</span>`;
        });
    }
    createErrorPosition() {
        switch (this.language) {
            case 'Bash':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'if (( "$name" == "Max" && $age -ge 18 )); then'; // (()) instead of [[]]
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if *[[* "$name" == "Max" && $age -ge 18 *]]*; then');
                        this.errorNote = 'Bash uses [[...]] for conditionals with advanced features.';
                        break;
                    case 2:
                        this.scriptLines[0] = 'if [ "$name" == "Max" && $age -ge 18 ]; then'; // [] instead of [[]]
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if *[[* "$name" == "Max" && $age -ge 18 *]]*; then');
                        this.errorNote = 'Bash uses [[...]] for conditionals with advanced features.';
                        break;
                    case 3:
                        this.scriptLines[0] = 'if [["$name" == "Max" && $age -ge 18]]; then'; // missing whitespaces
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if *[[* "$name" == "Max" && $age -ge 18 *]]*; then');
                        this.errorNote = 'In Bash, you need a whitespace after the [[ and before the ]].';
                        break;
                    case 4:
                        this.scriptLines[0] = 'if [[ "name" == "Max" && $age -ge 18 ]]; then'; // missing $ for "$name"
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "*$name*" == "Max" && $age -ge 18 ]]; then');
                        this.errorNote = 'In Bash, you need a "$" to access the value of a variable.';
                        break;
                    case 5:
                        this.scriptLines[0] = 'if [[ "$name" -eq "Max" && $age -ge 18 ]]; then'; // -eq instead of ==
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" *==* "Max" && $age -ge 18 ]]; then');
                        this.errorNote = 'In Bash, "-eq" is a numeric comparison operator. For strings "==" is used.';
                        break;
                    case 6:
                        this.scriptLines[0] = 'if [[ "$name" = "Max" && $age -ge 18 ]]; then'; // = instead of ==
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" *==* "Max" && $age -ge 18 ]]; then');
                        this.errorNote = 'The comparison operator should be "==" instead of "=".';
                        break;
                    case 7:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" & $age -ge 18 ]]; then'; // & instead of &&
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" *&&* $age -ge 18 ]]; then');
                        this.errorNote = 'The logical AND operator in Bash is "&&".';
                        break;
                    case 8:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && age -ge 18 ]]; then'; // age instead of $age
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && *$age* -ge 18 ]]; then');
                        this.errorNote = 'In Bash, you need a "$" to access the value of a variable.';
                        break;
                    case 9:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age ge 18 ]]; then'; // ge instead of -ge
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age *-ge* 18 ]]; then');
                        this.errorNote = 'The comparison operator "-ge" misses the "-".';
                        break;
                    case 10:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age >= 18 ]]; then'; // >= instead of -ge
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age *-ge* 18 ]]; then');
                        this.errorNote = 'In Bash, ">=" is not valid in [[ ... ]] for numeric comparison.';
                        break;
                    case 11:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age -gr 18 ]]; then'; // -gr instead of -ge
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age *-ge* 18 ]]; then');
                        this.errorNote = 'In Bash, "-gr" is not a valid comparison operator.';
                        break;
                    case 12:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age -ge 18]]; then'; // missing whitespace
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age -ge 18 *]]*; then');
                        this.errorNote = 'In Bash you need a whitespace after the [[ and before the ]].';
                        break;
                    case 13:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]] then'; // missing ;
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]]*;* then');
                        this.errorNote = 'In Bash, "then" must be either on a new line, or after a semicolon.';
                        break;
                    case 14:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]];'; // missing then
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]]; *then*');
                        this.errorNote = 'In Bash, you must use "then" in an if statement.';
                        break;
                    case 15:
                        this.scriptLines[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]]; do'; // do instead of then
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if [[ "$name" == "Max" && $age -ge 18 ]]; *then*');
                        this.errorNote = 'In Bash, an if statement uses "then".';
                        break;
                    case 16:
                        this.scriptLines[2] = 'done'; // done instead of fi
                        this.errorPreview[2] = this.highlightRed(this.errorPreview[2] = '*fi*');
                        this.errorNote = 'In Bash, "done" is used in loops. If statements require a "fi".';
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.language}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'PowerShell':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'if [$name -eq "Max" -and $age -ge 18] {'; // [] instead of ()
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if *(*$name -eq "Max" -and $age -ge 18*)* {');
                        this.errorNote = 'PowerShell uses (...) for conditional.';
                        break;
                    case 2:
                        this.scriptLines[0] = 'if (name -eq "Max" -and $age -ge 18) {'; // name instead of $name
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if (*$name* -eq "Max" -and $age -ge 18) {');
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.';
                        break;
                    case 3:
                        this.scriptLines[0] = 'if ($name eq "Max" -and $age -ge 18) {'; // eq instead of -eq
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name *-eq* "Max" -and $age -ge 18) {');
                        this.errorNote = 'The comparison operator "-eq" misses the "-".';
                        break;
                    case 4:
                        this.scriptLines[0] = 'if ($name -eg "Max" -and $age -ge 18) {'; // -eg instead of -eq
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name *-eq* "Max" -and $age -ge 18) {');
                        this.errorNote = 'In PowerShell, "-eg" is not a valid comparison operator.';
                        break;
                    case 5:
                        this.scriptLines[0] = 'if ($name -eq "Max" and $age -ge 18) {'; // and instead of -and
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name -eq "Max" *-and* $age -ge 18) {');
                        this.errorNote = 'The logical AND operator in PowerShell is "-and".';
                        break;
                    case 6:
                        this.scriptLines[0] = 'if ($name -eq "Max" -and age -ge 18) {'; // age instead of $age
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name -eq "Max" -and *$age* -ge 18) {');
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.';
                        break;
                    case 7:
                        this.scriptLines[0] = 'if ($name -eq "Max" -and $age ge 18) {'; // ge instead of -ge
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name -eq "Max" -and $age *-ge* 18) {');
                        this.errorNote = 'The comparison operator "-ge" misses the "-".';
                        break;
                    case 8:
                        this.scriptLines[0] = 'if ($name -eq "Max" -and $age -gr 18) {'; // -gr instead of -ge
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if ($name -eq "Max" -and $age *-ge* 18) {');
                        this.errorNote = 'In PowerShell, "-gr" is not a valid comparison operator.';
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.language}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'Python':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'if $name == "Max" and age >= 18:'; // $name instead of name
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if *name* == "Max" and age >= 18:');
                        this.errorNote = 'In Python, you do not use $ do access the value of a variable.';
                        break;
                    case 2:
                        this.scriptLines[0] = 'if name = "Max" and age >= 18:'; // = instead of ==
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name *==* "Max" and age >= 18:');
                        this.errorNote = 'The comparison operator should be "==" instead of "=".';
                        break;
                    case 3:
                        this.scriptLines[0] = 'if name == Max and age >= 18:'; // Max instead of "Max"
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == *"Max"* and age >= 18:');
                        this.errorNote = 'In Python, "Max" needs to be quoted to be recognized as a string.';
                        break;
                    case 4:
                        this.scriptLines[0] = 'if name == "Max" && age >= 18:'; // && instead of and
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == "Max" *and* age >= 18:');
                        this.errorNote = 'The logical AND operator in Python is "and".';
                        break;
                    case 5:
                        this.scriptLines[0] = 'if name == "Max" and $age >= 18:'; // $age instead of age
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == "Max" and *age* >= 18:');
                        this.errorNote = 'In Python, you do not use $ do access the value of a variable.';
                        break;
                    case 6:
                        this.scriptLines[0] = 'if name == "Max" and age => 18:'; // => instead of >=
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == "Max" and age *>=* 18:');
                        this.errorNote = 'Python uses ">=" for “greater than or equal to” — not "=>".';
                        break;
                    case 7:
                        this.scriptLines[0] = 'if name == "Max" and age >= "18":'; // "18" instead of 18
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == "Max" and age >= *18*:');
                        this.errorNote = 'In Python, you cannot compare a number to a string. The "18" needs to be unquoted.';
                        break;
                    case 8:
                        this.scriptLines[0] = 'if name == "Max" and age >= 18'; // missing :
                        this.errorPreview[0] = this.highlightRed(this.errorPreview[0] = 'if name == "Max" and age >= 18*:*');
                        this.errorNote = 'In Python, an if statement must end with a colon.';
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.language}. Error position: ${this.errorPosition}`);
                }
                break;
        }
    }
}
//# sourceMappingURL=Conditions.js.map