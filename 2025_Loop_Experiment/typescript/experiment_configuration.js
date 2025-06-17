import { BROWSER_EXPERIMENT } from "../../N-of-1-Experimentation/modules/Experimentation/Browser_Output_Writer.js";
import { keys, Reaction_Time, SET_SEED } from "../../N-of-1-Experimentation/modules/Experimentation/Experimentation.js";
import { ScriptGenerator } from "./code/input_file_loop/loops.js";
let SEED = "41";
SET_SEED(SEED);
let experiment_configuration_function = (writer) => {
    return {
        experiment_name: "Loops-Experiment",
        seed: SEED,
        introduction_pages: [
            () => writer.print_string_on_stage("Thank you for participating in this experiment.<br><br>" +
                "This study investigates how easily developers can identify errors in code written in <strong>Bash, PowerShell, or Python</strong>.<br><br>" +
                "Your task is to read short code snippets and determine whether or not they contain an error.<br><br>" +
                "<p>Before you begin, you may want to switch your browser to full-screen mode by pressing <code>[F11]</code> on your keyboard.</p>"),
            () => writer.print_string_on_stage("In the experiment, you will first see a short code snippet that loops through a file.<br><br>" +
                "After reviewing the code, you will proceed to the task. In the task, you will be shown the same snippet again, but it may now contain an error.<br><br>" +
                "If the code contains an error, press <code>[e]</code>. If the code does not contain an error, press <code>[1]</code>."),
            () => writer.print_string_on_stage("The code snippets only include logic related to looping through an input file.<br>" +
                "The loop body is is represented by a comment and will <strong>not</strong> contain an error and can be ignored during the experiment.<br>" +
                "In all tasks, the variable <strong>input</strong> is already defined and refers to the input file.<br><br>" +
                "Here is an example of looping through a file using the <strong>mapfile</strong> command in <strong>Bash</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkred; padding: 5px;'><code>" +
                "1. mapfile -t files < \"$input\"<br>" +
                "2. for file in \"${files[@]}\"; do<br>" +
                "3. &nbsp;&nbsp;# loop body<br>" +
                "4. done<br>" +
                "</td></tr>" +
                "</table></code><br>" +
                "In this example, an error could occur in line 1, 2, or 4, but <strong>not</strong> in line 3. Line 3 can be ignored during the experiment.<br>" +
                "Errors may include issues that cause runtime failures, such as missing the $ when referencing a variable or omitting quotation marks.<br>" +
                "Changes that alter the intended logic of the code, such as using a different option instead of \"-t\", are also considered errors.<br><br>" +
                "&#9888; Note that in the Bash, missing or overusing whitespaces can lead to errors.<br>"),
            () => writer.print_string_on_stage("The tasks showcase six ways to loop through an input file using <strong>Bash, PowerShell and Python</strong>.<br><br>" +
                "These are not the only ways these languages allow you to loop through an input file but are the ones focused on in the experiment.<br><br>" +
                "It is <strong>not</strong> necessary to memorize the code snippets, as they will be shown again."),
            () => writer.print_string_on_stage("1. <strong>Bash</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkred; padding: 5px;'><code>" +
                "mapfile -t files < \"$input\"<br>" +
                "for file in \"${files[@]}\"; do<br>" +
                "&nbsp; # loop body<br>" +
                "done<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("2. <strong>Bash</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkred; padding: 5px;'><code>" +
                "while read -r file || [[ -n \"$file\" ]]; do<br>" +
                "&nbsp # loop body<br>" +
                "done < \"$input\"<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("3. <strong>PowerShell</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkblue; padding: 5px;'><code>" +
                "Get-Content $input | ForEach-Object {<br>" +
                "&nbsp # loop body<br>" +
                "}<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("4. <strong>PowerShell</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkblue; padding: 5px;'><code>" +
                "foreach ($line in Get-Content $input) {<br>" +
                "&nbsp # loop body<br>" +
                "}<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("5. <strong>PowerShell</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkblue; padding: 5px;'><code>" +
                "$reader = [System.IO.StreamReader]::new($input)<br>" +
                "while (($line = $reader.ReadLine()) -ne $null) {<br>" +
                "&nbsp # loop body<br>" +
                "}<br>" +
                "$reader.Close()<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("6. <strong>Python</strong>:<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkgreen; padding: 5px;'><code>" +
                "with open(input, \"r\") as file:<br>" +
                "&nbsp for line in file:<br>" +
                "&nbsp&nbsp&nbsp # loop body<br>" +
                "</td></tr>" +
                "</table></code>"),
            () => writer.print_string_on_stage("When you're ready, continue to the training phase by pressing <code>[Enter]</code>.<br>"),
        ],
        pre_run_training_instructions: writer.string_page_command("You entered the training phase."),
        pre_run_experiment_instructions: writer.string_page_command(writer.convert_string_to_html_string("You entered the experiment phase.")),
        finish_pages: [
            writer.string_page_command("<p>Almost done. Next, the experiment data will be downloaded (after pressing [Enter]).<br><br>" +
                "Please, send the downloaded file to the experimenter who will do the analysis</p>")
        ],
        layout: [
            { variable: "Script_Language", treatments: ["bash", "pS", "pSforeach", "bmap", "pSreader", "py"] },
            { variable: "Error_Position", treatments: ["dummy"] },
            { variable: "Error_Section", treatments: ["dummy"] },
            { variable: "Has_Error", treatments: ["true", "false"] },
            { variable: "Reading Time", treatments: ["dummy"] },
        ],
        repetitions: 5,
        measurement: Reaction_Time(keys(["1", "e"])),
        task_configuration: (t) => {
            let treatment = t.treatment_value("Script_Language");
            let errorTreatment = t.treatment_value("Has_Error") === "true";
            let task = new ScriptGenerator(treatment, errorTreatment);
            t.has_pre_task_description = true;
            let reading_time_start = null;
            let reading_time_stop = null;
            t.do_print_pre_task = () => {
                writer.print_string_on_stage("Language: <strong>" + task.language + "</strong>");
                writer.print_string_on_stage("This preview shows how the correct script should look.");
                writer.print_string_on_stage(task.generatePreview());
                writer.print_string_on_stage("Press <code>[1]</code> if the code has no error and <code>[e]</code> if the code has an error.<br><br>\n");
                writer.print_string_on_stage("&#9888; Please do <strong>not</strong> take a break in this preview.");
                writer.print_string_on_stage("Press [Return] to continue.");
                // Timer starten
                reading_time_start = new Date().getTime().valueOf();
            };
            t.do_print_task = () => {
                // Timer stoppen
                reading_time_stop = new Date().getTime().valueOf();
                writer.clear_stage();
                writer.print_html_on_stage(task.generateScript());
                let required_milliseconds = reading_time_stop - reading_time_start;
                t.set_computed_variable_value("Reading Time", required_milliseconds.toString());
            };
            t.set_computed_variable_value("Error_Section", task.getErrorSection());
            t.set_computed_variable_value("Error_Position", task.getErrorPosition());
            t.expected_answer = task.getCorrectAnswer();
            let errorNote = task.errorNote;
            t.do_print_after_task_information = () => {
                if (t.given_answer == t.expected_answer) {
                    if (t.expected_answer == "e") {
                        writer.print_string_on_stage("<div class='correct'>" + "CORRECT! Correct answer: " + t.expected_answer + "\n" + "</div>");
                        writer.print_string_on_stage("&#9888; " + errorNote);
                        writer.print_string_on_stage(task.generateErrorPreview());
                    }
                    else {
                        writer.print_string_on_stage("<div class='correct'>" + "CORRECT! Correct answer: " + t.expected_answer + "\n" + "</div>");
                    }
                }
                else {
                    if (t.expected_answer == "1") {
                        writer.print_string_on_stage("<span style=\"color: red;\">WRONG! The code is correct! Correct answer: " + t.expected_answer + "</span>\n");
                    }
                    else {
                        writer.print_string_on_stage("<span style=\"color: red;\">WRONG! The code is incorrect! Correct answer: " + t.expected_answer + "</span>\n");
                        writer.print_string_on_stage("&#9888; " + errorNote);
                        writer.print_string_on_stage(task.generateErrorPreview());
                    }
                }
                writer.print_string_on_stage("\n<br><br>You can take a break here if you need one.");
                writer.print_string_on_stage("Press [Return] to continue.");
            };
        },
        pre_activation_function: (f) => {
            let treatments = ["bash", "pS", "pSforeach", "bmap", "pSreader", "py"];
            let tasks = f.forwarders[2].experiment_definition.tasks;
            let new_tasks = [];
            let counter = 0;
            let next_expected_treatment_no = 0;
            while (tasks.length > 0) {
                if (tasks[counter].treatment_value("Script_Language") == treatments[next_expected_treatment_no]) {
                    let element = tasks[counter];
                    tasks.splice(counter, 1);
                    new_tasks.push(element);
                    counter = 0;
                    if (next_expected_treatment_no == 5) {
                        next_expected_treatment_no = 0;
                    }
                    else {
                        next_expected_treatment_no++;
                    }
                }
                else {
                    counter++;
                }
            }
            f.forwarders[2].experiment_definition.tasks = new_tasks;
        }
    };
};
BROWSER_EXPERIMENT(experiment_configuration_function);
//# sourceMappingURL=experiment_configuration.js.map