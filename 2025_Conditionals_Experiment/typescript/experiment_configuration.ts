import { BROWSER_EXPERIMENT } from "../../N-of-1-Experimentation/modules/Experimentation/Browser_Output_Writer.js";
import { Experiment_Forwarder } from "../../N-of-1-Experimentation/modules/Automata_Forwarders/Experiment_Forwarder.js";
import { Sequential_Forwarder_Forwarder } from "../../N-of-1-Experimentation/modules/Books/Sequential_Forwarder_Forwarder.js"
import {
    alternatives,
    Experiment_Output_Writer, keys, random_array_element, Reaction_Time, Time_to_finish, text_input_experiment,
    SET_SEED
} from "../../N-of-1-Experimentation/modules/Experimentation/Experimentation.js";
import { Task } from "../../N-of-1-Experimentation/modules/Experimentation/Task.js";
import { ConditionScriptGenerator } from "./code/conditions/Conditions.js";
let SEED = "43";

SET_SEED(SEED);

let experiment_configuration_function = (writer: Experiment_Output_Writer) => {
    return {

        experiment_name: "Conditionals-Experiment",
        seed: SEED,

        introduction_pages: [
            () => writer.print_string_on_stage(
                "Thank you for participating in this experiment.<br><br>" +
                "This study investigates how easily developers can identify errors in conditionals written in <strong>Bash, PowerShell, or Python</strong>.<br><br>" +
                "Your task is to read short code snippets and determine whether or not they contain an error.<br><br>" +
                "<p>Before you begin, you may want to switch your browser to full-screen mode by pressing <code>[F11]</code> on your keyboard.</p>"
            ),

            () => writer.print_string_on_stage(
                "At the start of each task, you will first see the programming language used.<br><br>" +
                "After continuing with <code>[Enter]</code>, the code snippet in the corresponding language will appear.<br><br>" +
                "If the code contains an error, press <code>[e]</code>. If the code does not contain an error, press <code>[1]</code>."
            ),

            () => writer.print_string_on_stage(
                "Each code snippet contains a simple conditional statement that compares a variable <strong>name</strong> to the string \"Max\" and a variable <strong>age</strong> to the integer 18.<br>" +
                "The variables are already defined: <strong>name</strong> holds a string, and <strong>age</strong> holds an integer.<br>" +
                "The condition body is just a comment and will <strong>not</strong> contain the error. It can be ignored.<br><br>" +
                "Please take a moment to look at the code snippets as you will need to find errors in them and they will not be shown again.<br><br>" +
                "&#9888; Note that in the Bash, missing or overusing whitespaces can lead to errors.<br><br>" +
                "<table style='border: 1px solid black;'>" +
                "<tr><td style='border: 3px solid darkblue; padding: 5px;'><code>" +
                "<strong>Python:</strong><br>" +
                "if name == \"Max\" and age >= 18:<br>" +
                "&nbsp;&nbsp;# Condition body<br>" +
                "</td></tr>" +
                "<tr><td style='border: 3px solid darkgreen; padding: 5px;'><code>" +
                "<strong>Powershell:</strong><br>" +
                "if ($name -eq \"Max\" -and $age -ge 18) {<br>" +
                "&nbsp;&nbsp;# Condition body<br>" +
                "}<br>" +
                "</td></tr>" +
                "<tr><td style='border: 3px solid darkred; padding: 5px;'><code>" +
                "<strong>Bash:</strong><br>" +
                "if [[ \"$name\" == \"Max\" && $age -ge 18 ]]; then<br>" +
                "&nbsp;&nbsp;# Condition body<br>" +
                "fi<br>" +
                "</td></tr>" +
                "</table></code><br>" +
                "When you're ready, continue to the training phase by pressing <code>[Enter]</code>.<br>"
            ),
        ],

        pre_run_training_instructions: writer.string_page_command(
            "You entered the training phase."
        ),

        pre_run_experiment_instructions: writer.string_page_command(
            writer.convert_string_to_html_string(
                "You entered the experiment phase."
            )),

        finish_pages: [
            writer.string_page_command(
                "<p>Almost done. Next, the experiment data will be downloaded (after pressing [Enter]).<br><br>" +
                "Please, send the downloaded file to the experimenter who will do the analysis</p>"
            )
        ],

        layout: [
            { variable: "Script_Language", treatments: ["PowerShell", "Bash", "Python"] },
            { variable: "Error_Position", treatments: ["dummy"] },
            { variable: "Has_Error", treatments: ["true", "false"] },
        ],
        repetitions: 8,

        measurement: Reaction_Time(keys(["1", "e"])),

        task_configuration: (t: Task) => {
            let scriptLanguage = t.treatment_value("Script_Language") as "Bash" | "PowerShell" | "Python"
            let errorTreatment = t.treatment_value("Has_Error") === "true"
            let task = new ConditionScriptGenerator(scriptLanguage, errorTreatment)
            
            t.has_pre_task_description = true;
            t.do_print_pre_task = () => {
                writer.print_string_on_stage("Task: " + "<strong>" + scriptLanguage + "</strong>")
                writer.print_string_on_stage("Press <code>[1]</code> if the code has no error and <code>[e]</code> if the code has an error.<br><br>")
                writer.print_string_on_stage("You can take a break if you need one.")
                writer.print_string_on_stage("\nPress [Return] to continue.")
            }

            t.do_print_task = () => {
                writer.clear_stage();

                writer.print_html_on_stage(task.generateScript())
            };
            t.set_computed_variable_value("Error_Position", task.getErrorPosition())
            t.expected_answer = task.getCorrectAnswer();
            let errorNote = task.errorNote;

            t.do_print_after_task_information = () => {
                if (t.given_answer == t.expected_answer) {
                    writer.print_string_on_stage("<div class='correct'>" + "CORRECT! Correct answer: " + t.expected_answer + "\n" + "</div>");
                } else {
                    if (t.expected_answer == "1") {
                        writer.print_string_on_stage("<span style=\"color: red;\">WRONG! The code is correct! Correct answer: "+ t.expected_answer +"</span>\n");
                    }
                    else {
                        writer.print_string_on_stage("<span style=\"color: red;\">WRONG! The code is incorrect! Correct answer: " + t.expected_answer + "</span>\n");
                        writer.print_string_on_stage("&#9888; " + errorNote)
                        writer.print_string_on_stage(task.generateErrorPreview())
                    }
                }
                writer.print_string_on_stage("<br>Press [Return] to continue.")
            }
        },
        pre_activation_function: (f:Sequential_Forwarder_Forwarder) => {
            let treatments = ["Bash", "PowerShell", "Python"];

            let tasks = (f.forwarders[2] as Experiment_Forwarder).experiment_definition.tasks;
            let new_tasks = [];

            let counter = 0;
            let next_expected_treatment_no = 0;
            while (tasks.length > 0) {
                if (tasks[counter].treatment_value("Script_Language") == treatments[next_expected_treatment_no]) {
                    let element = tasks[counter];
                    tasks.splice(counter, 1);
                    new_tasks.push(element);
                    counter = 0;
                    if (next_expected_treatment_no == 2) {
                        next_expected_treatment_no = 0;
                    } else {
                        next_expected_treatment_no++;
                    }
                } else {
                    counter++;
                }
            }

            (f.forwarders[2] as Experiment_Forwarder).experiment_definition.tasks = new_tasks;
        }
    }
}

BROWSER_EXPERIMENT(experiment_configuration_function);
