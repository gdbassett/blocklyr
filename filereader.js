document.getElementById('file-input').addEventListener('change', handleFileImport);

function handleFileImport(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.fileName = file.name

    fileReader.onload = async function (e) {
        //console.log(e);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(e.target.result);

        await webR.FS.writeFile(e.target.fileName, buffer);
    };

    fileReader.readAsText(file);
}
