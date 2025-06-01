type Language = 'bash' | 'pS' | 'pSforeach' | 'bmap' | 'pSreader' | 'py'
export class ScriptGenerator {
    /*
    Code experiment that creates bash or powershell scripts with an error in a line.
    The subject of the experiment is to find the error in the script.
    ASSUME $input is a filename
    */
    private treatment: Language;
    private withError: boolean;
    private scriptLines: string[] = [];
    private correctScript: string[] = [];
    private errorPosition: number = 0;
    private errorSection: number = 0; // 1 to 5
    errorNote: string;
    language: string;

    constructor(treatment: Language, withError: boolean) {
        this.treatment = treatment;
        this.withError = withError;
        this.scriptLines = []
        if (this.treatment === 'bash') {
            this.scriptLines = this.getBashScriptWithCondition();
            this.language = "Bash"
        }
        else if (this.treatment === 'pS') {
            this.scriptLines = this.getPowerShellScript();
            this.language = "PowerShell"
        }
        else if (this.treatment === 'pSforeach') {
            this.scriptLines = this.getPowerShellForEachElement();
            this.language = "PowerShell"
        }
        else if (this.treatment === 'bmap') {
            this.scriptLines = this.getBashForLoopMapfile();
            this.language = "Bash"
        }
        else if (this.treatment === 'pSreader') {
            this.scriptLines = this.getPowershellNetClassStreamReader();
            this.language = "PowerShell"
        }
        else if (this.treatment === 'py') {
            this.scriptLines = this.getPythonLoop();
            this.language = "Python"
        }
        else {
            throw new Error(`Language: ${this.treatment} not supported.`)
        }
        this.correctScript = [...this.scriptLines];

        let maxErrorPositions = 0
        if (this.withError === true) {
            if (this.treatment === 'bash') {
                maxErrorPositions = 15
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            else if (this.treatment === 'pS') {
                maxErrorPositions = 5
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            else if (this.treatment === 'pSforeach') {
                maxErrorPositions = 6
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            else if (this.treatment === 'bmap') {
                maxErrorPositions = 16
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            else if (this.treatment === 'pSreader') {
                maxErrorPositions = 20
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            else if (this.treatment === 'py') {
                maxErrorPositions = 13
                this.errorPosition = this.getRandomNumber(maxErrorPositions)
            }
            // Calculate errorSection (1 to 5)
            this.errorSection = Math.ceil(this.errorPosition / (maxErrorPositions / 5));
            if (this.errorSection > 5) this.errorSection = 5; // Clamp to 5

            this.createErrorPosition();
        }
        else {
            this.errorPosition = 99;
            this.errorSection = 0;
        }

    }
    getCorrectAnswer() {
        if (this.withError) {
            return "e"
        }
        else {
            return "1"
        }
    }
    getErrorSection(): string {
        return this.errorSection.toString();
    }
    private getRandomNumber(upperLimit: number): number {
        if (upperLimit <= 0) {
            throw new Error('Upper limit must be greater than 0.');
        }
        return Math.floor(Math.random() * upperLimit) + 1;
    }
    generatePreview(): string {
        let result = this.correctScript.join('\n');
        let htmlString = result.replace(/\n/g, '<br>');
        return "<div class='sourcecode'>" + htmlString + "</div>";
    }
    generateScript(): string {
        let result = this.scriptLines.join('\n');
        let htmlString = result.replace(/\n/g, '<br>');
        return "<div class='sourcecode'>" + htmlString + "</div>";
    }

    getErrorPosition(): string {
        return this.errorPosition.toString();
    }

    private getBashScriptWithCondition(): string[] {
        return [
            'while read -r file || [[ -n "$file" ]]; do',
            '&nbsp # loop body',
            'done < "$input"',
        ];
    }

    private getPowerShellScript(): string[] {
        return [
            'Get-Content $input | ForEach-Object {',
            '&nbsp # loop body',
            '}',
        ];
    }

    private getPowerShellForEachElement(): string[] {
        return [
            'foreach ($line in Get-Content $input) {',
            '&nbsp # loop body',
            '}',
        ]
    }

    private getBashForLoopMapfile(): string[] {
        return [
            'mapfile -t files < "$input"',
            'for file in "${files[@]}"; do',
            '&nbsp # loop body',
            'done',
        ];
    }

    private getPowershellNetClassStreamReader(): string[] {
        return [
            '$reader = [System.IO.StreamReader]::new($input)',
            'while (($line = $reader.ReadLine()) -ne $null) {',
            '&nbsp # loop body',
            '}',
            '$reader.Close()',
        ]
        // :: is used to call static members (methods, propertie, constructors) of a .NET class
    }

    private getPythonLoop(): string [] {
        return [
            'with open(input, "r") as file:',
            '&nbsp for line in file:',
            '&nbsp&nbsp&nbsp # loop body',
        ]
    }

    createErrorPosition() {
        switch (this.treatment) {
            case 'bash':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'whiles read -r file || [[ -n "$file" ]]; do'; // whiles instead of while
                        this.errorNote = 'In Bash, the keyword is "while", not "whiles".'
                        break;
                        // TODO
                    case 2:
                        this.scriptLines[0] = 'while reads -r file || [[ -n "$file" ]]; do'; // reads instead of read
                        this.errorNote = 'In Bash, the command to read a line is "read", not "reads".'
                        break;
                    case 3:
                        this.scriptLines[0] = 'while read -n file || [[ -n "$file" ]]; do'; // -n instead of -r
                        this.errorNote = 'The correct option for the "read" command is "-r".'
                        break;
                    case 4:
                        this.scriptLines[0] = 'while read -r $file || [[ -n "$file" ]]; do'; // $file instead of file
                        this.errorNote = 'In Bash, the "$" is not used to declare a variable.'
                        break;
                    case 5:
                        this.scriptLines[0] = 'while read -r file | [[ -n "$file" ]]; do'; // | instead of ||
                        this.errorNote = 'The logical OR operator in Bash is "||".'
                        break;
                    case 6:
                        this.scriptLines[0] = 'while read -r file || [[-n "$file"]]; do'; // missing whitespaces in condition
                        this.errorNote = 'In Bash, you need a whitespace after the [[ and before the ]].'
                        break;
                    case 7:
                        this.scriptLines[0] = 'while read -r file || [[ -t "$file" ]]; do'; // -t instead of -n
                        this.errorNote = 'Bash uses "-n" to check if a variable is non-empty, not "-t".'
                        break;
                    case 8:
                        this.scriptLines[0] = 'while read -r file || [[ -n $file ]]; do'; // missing ""
                        this.errorNote = 'In Bash, not quoting a variable can cause word splitting.'
                        break;
                    case 9:
                        this.scriptLines[0] = 'while read -r file || [[ -n "file" ]]; do'; // file instead of $file
                        this.errorNote = 'In Bash, you need a "$" to access the value of a variable.'
                        break;
                    case 10:
                        this.scriptLines[0] = 'while read -r file || [[ -n "$file" ]] do'; // missing ;
                        this.errorNote = 'In Bash, "do" must be either on a new line, or after a semicolon.'
                        break;
                    case 11:
                        this.scriptLines[0] = 'while read -r file || [[ -n "$file" ]];'; // missing do
                        this.errorNote = 'In Bash, you must use "do" to start the loop body.'
                        break;
                    case 12:
                        this.scriptLines[2] = 'do < "$input"'; // do instead of done
                        this.errorNote = 'In Bash, you must use "done" to close a loop.'
                        break;
                    case 13:
                        this.scriptLines[2] = 'done > "$input"'; // > instead of <
                        this.errorNote = 'In Bash, use "<" to feed "$input" as input to the loop.'
                        break;
                    case 14:
                        this.scriptLines[2] = 'done < $input'; // missing ""
                        this.errorNote = 'In Bash, not quoting a variable can cause word splitting.'
                        break;
                    case 15:
                        this.scriptLines[2] = 'done < "input"'; // input instead of $input
                        this.errorNote = 'In Bash, you need a "$" to access the value of a variable.'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'pS':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'Get-Contents $input | ForEach-Object {'; // GetContent instead of Get-Content
                        this.errorNote = 'In PowerShell, the cmdlet is "Get-Content", not "Get-Contents".'
                        break;
                    case 2:
                        this.scriptLines[0] = 'Get-Content input | ForEach-Object {'; // input instead of $input
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.'
                        break;
                    case 3:
                        this.scriptLines[0] = 'Get-Content $input || ForEach-Object {'; // || instead of |
                        this.errorNote = 'In PowerShell, use "|" to pass output between commands.'
                        break;
                    case 4:
                        this.scriptLines[0] = 'Get-Content $input | For-Each-Object {'; // For-Each-Object instead of ForEach-Object
                        this.errorNote = 'In PowerShell, the cmdlet is "ForEach-Object", not "For-Each-Object".'
                        break;
                    case 5:
                        this.scriptLines[0] = 'Get-Content $input | ForEachObject {'; // ForEachObject instead of ForEach-Object
                        this.errorNote = 'In PowerShell, the cmdlet is "ForEach-Object", not "ForEachObject".'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'pSforeach':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'for ($line in Get-Content $input) {'; // for instead of foreach
                        this.errorNote = 'PowerShell uses "foreach" to iterate over collections, not "for".'
                        break;
                    case 2:
                        this.scriptLines[0] = 'foreach [$line in Get-Content $input] {'; // [] instead of ()
                        this.errorNote = 'In PowerShell, "foreach" requires "()" , not "[]".';

                        break;
                    case 3:
                        this.scriptLines[0] = 'foreach (line in Get-Content $input) {'; // line instead of $line
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.'
                        break;
                    case 4:
                        this.scriptLines[0] = 'foreach ($line Get-Content $input) {'; // missing in
                        this.errorNote = 'The "in" keyword is missing.'
                        break;
                    case 5:
                        this.scriptLines[0] = 'foreach ($line in Get-Contents $input) {'; // Get-Contents instead of Get-Content
                        this.errorNote = 'In PowerShell, the cmdlet is "Get-Content", not "Get-Contents".'
                        break;
                    case 6:
                        this.scriptLines[0] = 'foreach ($line in Get-Content input) {'; // missing $ for input
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'bmap':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'mapfiles -t files < "$input"'; // mapfiles instead of mapfile
                        this.errorNote = 'In Bash, the correct command is "mapfile", not "mapfiles".'
                        break;
                    case 2:
                        this.scriptLines[0] = 'mapfile -r files < "$input"'; // -r instead of -t
                        this.errorNote = 'In Bash, "-r" is no valid option for the "mapfile" command.'
                        break;
                    case 3:
                        this.scriptLines[0] = 'mapfile -t $files < "$input"'; // $files instead of files
                        this.errorNote = 'In Bash, the "$" is not used to declare a variable.'
                        break;
                    case 4:
                        this.scriptLines[0] = 'mapfile -t files > "$input"'; // > instead of <
                        this.errorNote = 'In Bash, use "<" to feed "$input" as input to the command.'
                        break;
                    case 5:
                        this.scriptLines[0] = 'mapfile -t files < $input'; // missing "" around $input
                        this.errorNote = 'In Bash, not quoting a variable can cause word splitting.'
                        break;
                    case 6:
                        this.scriptLines[0] = 'mapfile -t files < "input"'; // input instead of $input
                        this.errorNote = 'In Bash, you need a "$" to access the value of a variable.'
                        break;
                    case 7:
                        this.scriptLines[1] = 'foreach file in "${files[@]}"; do'; // foreach instead of for
                        this.errorNote = 'In Bash, use "for" instead of "foreach" to loop over arrays.'
                        break;
                    case 8:
                        this.scriptLines[1] = 'for $file in "${files[@]}"; do'; // $file instead of file
                        this.errorNote = 'In Bash, the "$" is not used to declare a variable.'
                        break;
                    case 9:
                        this.scriptLines[1] = 'for file "${files[@]}"; do'; // missing in
                        this.errorNote = 'The "in" keyword is missing.'
                        break;
                    case 10:
                        this.scriptLines[1] = 'for file in ${files[@]}; do'; // missing "" around ${files[@]}
                        this.errorNote = 'In Bash, not quoting a variable can cause word splitting.'
                        break;
                    case 11:
                        this.scriptLines[1] = 'for file in "{files[@]}"; do'; // missing $
                        this.errorNote = 'In Bash, you need a "$" to expand the value of an array variable.'
                        break;
                    case 12:
                        this.scriptLines[1] = 'for file in "$files[@]"; do'; // missing {}
                        this.errorNote = 'In Bash, use "{}" to expand array elements.'
                        break;
                    case 13:
                        this.scriptLines[1] = 'for file in "${files(@)}"; do'; // () instead of []
                        this.errorNote = 'In Bash, use "[]" to expand array elements, not "()".'
                        break;
                    case 14:
                        this.scriptLines[1] = 'for file in "${files[@]}" do'; // missing ;
                        this.errorNote = 'In Bash, "do" must be either on a new line, or after a semicolon.'
                        break;
                    case 15:
                        this.scriptLines[1] = 'for file in "${files[@]}";'; // missing do
                        this.errorNote = 'In Bash, you must use "do" to start the loop body.'
                        break;
                    case 16:
                        this.scriptLines[3] = 'fi'; // fi instead of done
                        this.errorNote = 'In Bash, you must use "done" to close a loop.'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'pSreader':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'reader = [System.IO.StreamReader]::new($input)'; // reader instead of $reader
                        this.errorNote = 'In PowerShell, you need a "$" to declare a variable.'
                        break;
                    case 2:
                        this.scriptLines[0] = '$reader == [System.IO.StreamReader]::new($input)'; // == instead of =
                        this.errorNote = 'In PowerShell, use "=" to assign values to variables, not "==".'
                        break;
                    case 3:
                        this.scriptLines[0] = '$reader = (System.IO.StreamReader)::new($input)'; // () instead of []
                        this.errorNote = 'In PowerShell, use "[]" around class names for static method calls.'
                        break;
                    case 4:
                        this.scriptLines[0] = '$reader = [Systems.IO.StreamReader]::new($input)'; // systems instead of system
                        this.errorNote = 'The correct namespace is "System.IO.StreamReader" without the "s".'
                        break;
                    case 5:
                        this.scriptLines[0] = '$reader = [System.IO.StreamReader]:new($input)'; // : instead of ::
                        this.errorNote = 'In PowerShell, use "::" to call static methods, not ":".'
                        break;
                    case 6:
                        this.scriptLines[0] = '$reader = [System.IO.StreamReader]::($input)'; // missing new
                        this.errorNote = 'The "new" keyword is missing.'
                        break;
                    case 7:
                        this.scriptLines[0] = '$reader = [System.IO.StreamReader]::new[$input]'; // [$input] instead of ($input)
                        this.errorNote = 'In PowerShell, the constructor "new" uses "()", not "[]".'
                        break;
                    case 8:
                        this.scriptLines[1] = 'foreach (($line = $reader.ReadLine()) -ne $null) {'; // foreach instead of while
                        this.errorNote = 'In PowerShell, use "while" to loop while a condition is true, not "foreach".'
                        break;
                    case 9:
                        this.scriptLines[1] = 'while [($line = $reader.ReadLine()) -ne $null] {'; // [] instead of ()
                        this.errorNote = 'In PowerShell, while uses "()", not "[]".'
                        break;
                    case 10:
                        this.scriptLines[1] = 'while ($line = $reader.ReadLine() -ne $null) {'; // missing ()
                        this.errorNote = 'The "()" around the assignment are missing.'
                        break;
                    case 11:
                        this.scriptLines[1] = 'while ((line = $reader.ReadLine()) -ne $null) {'; // line instead of $line
                        this.errorNote = 'In PowerShell, you need a "$" to declare a variable.'
                        break;
                    case 12:
                        this.scriptLines[1] = 'while (($line == $reader.ReadLine()) -ne $null) {'; // == instead of =
                        this.errorNote = 'In PowerShell, use "=" to assign values to variables, not "==".'
                        break;
                    case 13:
                        this.scriptLines[1] = 'while (($line = reader.ReadLine()) -ne $null) {'; // reader instead of $reader
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.'
                        break;
                    case 14:
                        this.scriptLines[1] = 'while (($line = $reader.ReadLines()) -ne $null) {'; // ReadLines instead of ReadLine
                        this.errorNote = 'In PowerShell, the correct method is "ReadLine()", not "ReadLines()".'
                        break;
                    case 15:
                        this.scriptLines[1] = 'while (($line = $reader.ReadLine) -ne $null) {'; // missing ()
                        this.errorNote = 'In PowerShell, you need "()" to call methods.'
                        break;
                    case 16:
                        this.scriptLines[1] = 'while (($line = $reader.ReadLine()) ne $null) {'; // ne instead of -ne
                        this.errorNote = 'The comparison operator "-ne" misses the "-".'
                        break;
                    case 17:
                        this.scriptLines[1] = 'while (($line = $reader.ReadLine()) -no $null) {'; // -no instead of -ne
                        this.errorNote = 'In PowerShell, "-no" is not a valid comparison operator.'
                        break;
                    case 18:
                        this.scriptLines[1] = 'while (($line = $reader.ReadLine()) -ne null) {'; // null instead of $null
                        this.errorNote = 'In PowerShell, use "$null" to represent null values, not "null".'
                        break;
                    case 19:
                        this.scriptLines[4] = 'reader.Close()' // missing $
                        this.errorNote = 'In PowerShell, you need a "$" to access the value of a variable.'
                        break;
                    case 20:
                        this.scriptLines[4] = '$reader.Close' // missing ()
                        this.errorNote = 'In PowerShell, you need "()" to call methods.'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
            case 'py':
                switch (this.errorPosition) {
                    case 1:
                        this.scriptLines[0] = 'with (input, "r") as file:'; // missing open
                        this.errorNote = 'The "open" keyword is missing.'
                        break;
                    case 2:
                        this.scriptLines[0] = 'with open[input, "r"] as file:'; // [] instead of ()
                        this.errorNote = 'In Python, function calls use "()", not "[]".'
                        break;
                    case 3:
                        this.scriptLines[0] = 'with open($input, "r") as file:'; // $input instead of input
                        this.errorNote = 'In Python, you do not use $ do access the value of a variable.'
                        break;
                    case 4:
                        this.scriptLines[0] = 'with open(input; "r") as file:'; // ; instead of ,
                        this.errorNote = 'In Python, function arguments are separated by ",", not ";".'
                        break;
                    case 5:
                        this.scriptLines[0] = 'with open(input, r) as file:'; // r instead of "r"
                        this.errorNote = 'In Python, without the quotes, a variable is expected.'
                        break;
                    case 6:
                        this.scriptLines[0] = 'with open(input, "r") in file:'; // in instead of as
                        this.errorNote = 'In Python, use "as" to assign the file object in a "with" statement, not "in".'
                        break;
                    case 7:
                        this.scriptLines[0] = 'with open(input, "r") as $file:'; // $file instead of file
                        this.errorNote = 'In Python, variable names do not start with a "$".'
                        break;
                    case 8:
                        this.scriptLines[0] = 'with open(input, "r") as file'; // missing :
                        this.errorNote = 'In Python, a "with" statement must end with a colon.'
                        break;
                    case 9:
                        this.scriptLines[1] = '&nbsp foreach line in file:'; // foreach instead of for
                        this.errorNote = 'In Python, use "for" to loop over items, not "foreach".'
                        break;
                    case 10:
                        this.scriptLines[1] = '&nbsp for $line in file:'; // $line instead of line
                        this.errorNote = 'In Python, variable names do not start with a "$".'
                        break;
                    case 11:
                        this.scriptLines[1] = '&nbsp for line file:'; // missing in
                        this.errorNote = 'The "in" keyword is missing.'
                        break;
                    case 12:
                        this.scriptLines[1] = '&nbsp for line in $file:'; // $file instead of file
                        this.errorNote = 'In Python, you do not use $ do access the value of a variable.'
                        break;
                    case 13:
                        this.scriptLines[1] = '&nbsp for line in file'; // missing :
                        this.errorNote = 'In Python, a "for" loop must end with a colon.'
                        break;
                    default:
                        throw new Error(`Unsupported error position for ${this.treatment}. Error position: ${this.errorPosition}`);
                }
                break;
        }
    }
}