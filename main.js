// **** Build an array of RGB colors
const build_rgb = (image_data) =>
{
    const rbg_values = [];

    for (let i = 0; i < image_data.length; i += 4)
    {
        const rgb = {
            r: image_data[i],
            g: image_data[i + 1],
            b: image_data[i + 2],
        }
        rbg_values.push(rgb);
    }

    return rbg_values;
}


// **** Color quantization
// 1. Find color range
const find_biggest_color_range = (rgb_values) =>
{
    /**
     * Min is initialized to the maximum value possible
     * Then, find the minimum value for that color channel
     * 
     * Max is initialized to the minimum value possible
     * Then, find the maximum value for that color channel
     */

    let r_min = Number.MAX_VALUE;
    let g_min = Number.MAX_VALUE;
    let b_min = Number.MAX_VALUE;

    let r_max = Number.MIN_VALUE;
    let g_max = Number.MIN_VALUE;
    let b_max = Number.MIN_VALUE;

    rgb_values.forEach((pixel) =>
    {
        r_min = Math.min(r_min, pixel.r);
        g_min = Math.min(g_min, pixel.g);
        b_min = Math.min(b_min, pixel.b);

        r_max = Math.max(r_max, pixel.r);
        g_max = Math.max(g_max, pixel.g);
        b_max = Math.max(b_max, pixel.b);
    });
}

const r_range = r_max - r_min;
const g_range = g_max - g_min;
const b_range = b_max - b_min;

// Finding the color with the biggest difference
const biggest_range = Math.max(r_range, g_range, b_range);
switch (biggest_range)
{
    case r:
        return r;
        break;

    case g:
        return g;
        break;

    case b:
        return b;
        break;

    default:
        break;
}


/**
 * Median cut implementation to get color quantization
 */

const quantization = (rgb_values, depth) =>
{
    const MAX_DEPTH = 4;

    // Best case
    if (depth === MAX_DEPTH || rgb_values === 0)
    {
        const color = rbg_values.reduce(
            (prev, curr) =>
            {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;

                return prev;
            }, { r: 0, g: 0, b: 0 }
        );

        color.r = Math.round(color, r / rbg_values.length)
        color.g = Math.round(color, g / rbg_values.length)
        color.b = Math.round(color, b / rbg_values.length)

        return [color];
    }

    /**
     * Recursion
     * 1. Find the pixel channel with the biggest difference/range
     * 2. Order by this channel
     * 3. Divide in hald the rgb colors list
     * 4. Repeat the process again, until the desired depth or best case
     */

    const component_to_sort_by = find_biggest_color_range(rbg_values);

    // 2. Sort pixels by that channel
    rgb_values.sort((p1, p2) =>
    {
        return p1[component_to_sort_by] - p2[component_to_sort_by];
    })

    // 3. Divide the first list in half
    const mid = rgb_values.length / 2
    return [
        ...quantization(rgb_values.slice(0, mid), depth + 1),
        ...quantization(rgb_values.slice(mid + 1), depth + 1),
    ];
    // 4. Repeat the process until you have the desired number of colors - the recursion
}




// Add everything together
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
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

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

