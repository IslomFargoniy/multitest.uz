// components/ui/baseButton.js
export const baseButton = `
    inline-flex items-center gap-2
    font-medium text-sm
    rounded-lg px-4 py-2
    transition-colors duration-200

    focus:outline-none
    focus:ring-2 focus:ring-offset-2
    focus:ring-blue-500
    focus:ring-offset-white

    dark:focus:ring-blue-400
    dark:focus:ring-offset-gray-900

    disabled:opacity-60
    disabled:cursor-not-allowed
`;
