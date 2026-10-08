export const OPEN_PROGRAM_PICKER_EVENT = "courseflix:open-program-picker";

/** Opens the program picker sheet mounted in the root layout. */
export function openProgramPicker() {
  window.dispatchEvent(new Event(OPEN_PROGRAM_PICKER_EVENT));
}
