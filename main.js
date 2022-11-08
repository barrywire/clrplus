const main = () =>
{
    const img_file = document.getElementById('img_file');
    const image = new Image();
    const file = img_file.files[0];
    const file_reader = new FileReader();

    // Whenever file & image is loaded procced to extract the information from the image
    file_reader.onload = () =>
    {
        image.onload = () =>
        {
            // Set the canvas size to be the same as of the uploaded image
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            /**
             * getImageData returns an array full of RGBA values
             * each pixel consists of four values: the red value of the colour, the green, the blue and the alpha
             * (transparency). For array value consistency reasons,
             * the alpha is not from 0 to 1 like it is in the RGBA of CSS, but from 0 to 255.
             */
            const image_data = ctx.getImageData(0, 0, image.width, image.height);
            console.log(image_data);
        }
        image.src = file_reader.result;
    }
    file_reader.readAsDataURL(file);
}

main();

