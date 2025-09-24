export type SelectionPosition = {
  start: number;
  end: number;
};

export type FormattingOptions = {
  name: "BOLD" | "ITALIC" | "UNDERLINE" | "H1" | "H2" | "H3" | "H4"
        | "H5" | "H6" | "QUOTE" | "CODE" | "LINK" | "IMAGE" | "BULLET_LIST"
        | "NUMBERED_LIST" | "CHECKBOX" | "TABLE" | "STRIKETHROUGH" | "SUBSCRIPT" | "SUPERSCRIPT";
  prefix: string;
  suffix?: string;
  defaultText?: string;
};