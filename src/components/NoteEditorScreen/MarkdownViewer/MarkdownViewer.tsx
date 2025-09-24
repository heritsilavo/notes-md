import { ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";

type NoteEditorScreenProps = {
    note: string;
}

export default function MarkdownViewer({ note }: NoteEditorScreenProps) {

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ height: '100%', paddingHorizontal: 16 }}
        >
            <Markdown>
                {note}
            </Markdown>
        </ScrollView>
    );
}