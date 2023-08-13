
class CommandSanitizer {
    constructor(private allowedCommands:string[] = ['ls']) {
    }

    /**
     * Check if the command is allowed and sanitize arguments.
     * @param {string} command
     * @returns {string|null} Returns sanitized command or null if command is not allowed.
     */
    sanitize(command) {
        const splitCommand = command.trim().split(' ');

        const baseCommand = splitCommand[0];

        if (!this.allowedCommands.includes(baseCommand)) {
            return null; // Command not allowed.
        }

        // If the command has arguments, sanitize them.
        const sanitizedArgs = splitCommand.slice(1).map(arg => {
            // Strip any characters that aren't alphanumeric, hyphen, or underscore.
            return arg.replace(/[^a-zA-Z0-9-_]/g, '');
        });

        return [baseCommand, ...sanitizedArgs].join(' ');
    }
}

const sanitizer = new CommandSanitizer();
