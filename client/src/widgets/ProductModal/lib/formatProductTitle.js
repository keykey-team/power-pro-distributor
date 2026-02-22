export const formatProductTitle = (title) => {
    if (!title) return null;
    
    const words = title.split(' ');
    
    // Если слов меньше 3, возвращаем null (не форматируем)
    if (words.length < 3) return null;
    
    const middleIndex = Math.ceil(words.length / 2);
    
    const firstPart = words.slice(0, middleIndex).join(' ');
    const secondPart = words.slice(middleIndex).join(' ');
    
    return {
        firstPart,
        secondPart
    };
};