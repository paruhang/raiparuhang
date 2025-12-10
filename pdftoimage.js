(() => {
    const btn = document.getElementById("pdf2img-btn");
    const input = document.getElementById("pdf2img-input");
    const output = document.getElementById("pdf2img-output");

    btn.addEventListener("click", async () => {
        const file = input.files[0];
        if (!file) return alert("Please upload a PDF.");

        output.style.display = "block";
        output.innerHTML = "<p>Converting...</p>";

        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;

        output.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgURL = canvas.toDataURL("image/png");

            const img = document.createElement("img");
            img.src = imgURL;

            const link = document.createElement("a");
            link.href = imgURL;
            link.download = `image-${i}.png`;
            link.textContent = `Download image ${i}`;

            output.appendChild(img);
            output.appendChild(link);
        }
    });
})();
