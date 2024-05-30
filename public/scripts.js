document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const files = document.getElementById('folderInput').files;

    for (let i = 0; i < files.length; i++) {
        formData.append('pdfs', files[i]);
    }

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Archivos convertidos exitosamente.');
        } else {
            alert(result.message || 'Error en el proceso de conversión.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el proceso de conversión.');
    }
});

function extractFirstWordAfterParenthesis(content) {
    const lines = content.split('\n');
    const result = [];
    const capturedWords = [];
    const followingSentences = [];
    const editorial = [];

    lines.forEach(line => {
        const match = line.match(/\(\d{2}/);  
        if (match && /[A-Za-z]{4,},\s[A-Za-z]\./.test(line)) {  
            const words = line.split(' ');
            const firstWord = words[0];
            if (firstWord.length > 3) {
                result.push(firstWord.slice(0, -1));  
                
                const specialMatch = line.match(/\((\d{4})\)|\((\d{4}),\s[A-Za-z0-9]/);
                if (specialMatch) {
                    
                    const fourDigits = specialMatch[1] || specialMatch[2];
                    capturedWords.push(fourDigits);

                    const sentences = line.split('.');
                    for (let i = 0; i < sentences.length - 1; i++) {
                        if (sentences[i].trim().endsWith(')')) {
                            if(sentences[i + 1].trim().length > 1){
                                followingSentences.push(sentences[i + 1].trim());
                                i ++;
                            }
                            if(sentences[i + 1].trim().length > 1) {
                                if(sentences[i + 1].trim().startsWith('http')) {
                                    let nextSentenceIndex = i + 1;
                                    let concatenatedSentences = '';
                                    while (nextSentenceIndex < sentences.length && sentences[nextSentenceIndex].trim().length > 1) {
                                        concatenatedSentences += sentences[nextSentenceIndex].trim(); 
                                        if (nextSentenceIndex < sentences.length - 1 && sentences[nextSentenceIndex + 1].trim().length > 1) {
                                            concatenatedSentences += '.'; 
                                        }
                                        nextSentenceIndex++;
                                    }                                    
                                    editorial.push(concatenatedSentences);
                                } else {
                                    const sentenceParts = sentences[i + 1].trim().split(',');
                                    if (sentenceParts.length > 1) {
                                        editorial.push(sentenceParts[0].trim());
                                    } else {
                                        if (sentences[i + 1].trim().includes('(')) {
                                            const sentencePartsParts = sentences[i + 1].trim().split('(');
                                            editorial.push(sentencePartsParts[0].trim());
                                        } else {
                                            editorial.push(sentences[i + 1].trim());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return {
        filteredWords: result.join('\n'),
        specialWords: capturedWords.join('\n'),
        followingSentences: followingSentences.join('\n'),
        editorial: editorial.join('\n')
    };
}

async function displayTxtFiles() {
    const response = await fetch('/check-txt-files');
    const data = await response.json();

    let content = '';
    data.filesContent.forEach(fileContent => {
        const { filteredWords, specialWords, followingSentences, editorial } = extractFirstWordAfterParenthesis(fileContent);
        content += `<h3>Autores:</h3><pre>${filteredWords}</pre>`;
        content += `<h3>Años:</h3><pre>${specialWords}</pre>`;
        content += `<h3>Titulos:</h3><pre>${followingSentences}</pre>`;
        content += `<h3>Editorial:</h3><pre>${editorial}</pre>`;
    });

    document.getElementById('resultados').innerHTML = content;
    document.getElementById('resultados').style.display = 'block';
}

document.getElementById('processBtn').addEventListener('click', displayTxtFiles);


//Conteo de frecuencias de autores, titulos, año y editorial (Diego)
function countFrequencies(content) {
    const { filteredWords, specialWords, followingSentences, editorial } = extractFirstWordAfterParenthesis(content);

    const authorFrequencies = {};
    const titleFrequencies = {};
    const yearFrequencies = {};
    const editorialFrequencies = {};

    const authors = filteredWords.split('\n');
    authors.forEach(author => {
        authorFrequencies[author] = (authorFrequencies[author] || 0) + 1;
    });
    const titles = followingSentences.split('\n');
    titles.forEach(title => {
        titleFrequencies[title] = (titleFrequencies[title] || 0) + 1;
    });
    const years = specialWords.split('\n');
    years.forEach(year => {
        yearFrequencies[year] = (yearFrequencies[year] || 0) + 1;
    });
    const editorials = editorial.split('\n');
    editorials.forEach(editorial => {
        editorialFrequencies[editorial] = (editorialFrequencies[editorial] || 0) + 1;
    });

    return {
        authorFrequencies,
        titleFrequencies,
        yearFrequencies,
        editorialFrequencies
    };
}

const content = '... contenido de texto ...';
const { authorFrequencies, titleFrequencies, yearFrequencies, editorialFrequencies } = countFrequencies(content);

console.log('Frecuencias de autores:', authorFrequencies);
console.log('Frecuencias de títulos:', titleFrequencies);
console.log('Frecuencias de años:', yearFrequencies);
console.log('Frecuencias de editoriales:', editorialFrequencies);
