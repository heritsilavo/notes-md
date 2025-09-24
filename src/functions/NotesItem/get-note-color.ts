import { ThemeColor } from "../../constants/colors";

export const getNoteColors = (typenote: string) => {
  const colorMap = {
    checklist: {
      backgroundColor: '#E8F5E9',  // Vert très clair
      textColor: ThemeColor.primary
    },
    texte: {
      backgroundColor: '#E1F5FE',  // Bleu clair ciel
      textColor: ThemeColor.primary
    },
    citation: {
      backgroundColor: '#FFF8E1',  // Jaune clair chaud
      textColor: ThemeColor.primary
    },
    événement: {
      backgroundColor: '#FCE4EC',  // Rose très pâle
      textColor: ThemeColor.primary
    },
    idée: {
      backgroundColor: '#EDE7F6',  // Violet pastel
      textColor: ThemeColor.primary
    },
    liste: {
      backgroundColor: '#E0F7FA',  // Bleu clair aqua
      textColor: ThemeColor.primary
    },
    code: {
      backgroundColor: '#E8EAF6',  // Bleu lavande
      textColor: ThemeColor.primary
    },
    default: {
      backgroundColor: '#E8EAF6',  // Gris très clair
      textColor: ThemeColor.primary
    }
  };

  return colorMap[typenote as keyof typeof colorMap] || colorMap.default;
};