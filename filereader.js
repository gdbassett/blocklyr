document.getElementById('file-input').addEventListener('change', handleFileImport);

function handleFileImport(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.fileName = file.name;

    fileReader.onload = async function (e) {
        console.log(e);
        if (e.target.fileName.endsWith(".csv")) {
            const encoder = new TextEncoder();
            const buffer = encoder.encode(e.target.result);
            await webR.FS.writeFile(e.target.fileName, buffer);
        } else {
            const buffer = convertBinaryStringToUint8Array(e.target.result);
            await webR.FS.writeFile(e.target.fileName, buffer);
        }


    };

    if (file.name.endsWith(".csv")) {
        fileReader.readAsText(file);
    } else {
        fileReader.readAsBinaryString(file);
    }
}

// https://gist.github.com/getify/7325764
function convertBinaryStringToUint8Array(bStr) {
    var i, len = bStr.length, u8_array = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        u8_array[i] = bStr.charCodeAt(i);
    }
    return u8_array;
}