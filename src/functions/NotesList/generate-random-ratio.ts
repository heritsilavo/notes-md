export const generateRandomRatio = () => {
  const ratios = [
    { widthRatio: 1, heightRatio: 1.0 },
    { widthRatio: 1, heightRatio: 1.4 },
    { widthRatio: 1, heightRatio: 1.6 },
    { widthRatio: 1, heightRatio: 1.3 },
    { widthRatio: 1, heightRatio: 1.05 },
    { widthRatio: 1, heightRatio: 1.1 },
  ];
  
  return ratios[Math.floor(Math.random() * ratios.length)];
};