// **** 1 Build an array of RGB colors
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


// **** 2 Color Quantization
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
};
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

// **** 3. Color difference
const calculate_color_difference = (color1, color2) =>
{
    const r_diff = Math.pow(color2.r - color1.r, 2);
    const g_diff = Math.pow(color2.g - color1.g, 2);
    const b_diff = Math.pow(color2.b - color1.b, 2);

    // TODO: Check the formula here
    // return Math.sqrt(r_diff + g_diff + b_diff);
    return r_diff + g_diff + b_diff;
}

// **** 4. Order colors by luminance
/**
 * Using relative luminance we order the brightness of the colors
 * the fixed values and further explanation about this topic
 * can be found here -> https://en.wikipedia.org/wiki/Luma_(video)
 */
const order_by_luminance = (rgb_values) =>
{
    const calculate_luminance = (color) =>
    {
        return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    }

    rgb_values.sort((a, b) =>
    {
        return calculate_luminance(a) - calculate_luminance(b);
    });
}


// **** Utility functions
// Utility 1 - Convert HSL to HEX
/**
 * Convert HSL to HEX
 * this entire formula can be found in stackoverflow, credits to @icl7126 !!!
 * https://stackoverflow.com/a/44134328/17150245
 */

const hsl_to_hex = (hsl_color) =>
{
    const hsl_color_copy = { ...hsl_color };

    hsl_color_copy.l /= 100;
    const a = hsl_color_copy.s * Math.min(hsl_color_copy.l, 1 - hsl_color_copy.l) / 100;
    const f = (n) =>
    {
        const k = (n + hsl_color_copy.h / 30) % 12;
        const color = hsl_color_copy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };

    return `#${ f(0) }${ f(8) }${ f(4) }`;
}

// Utility 2 - Convert RGB to HSL
/**
 * Convert RGB values to HSL
 * This formula can be
 * found here https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
const convert_rgb_to_hsl = (rgb_values) =>
{
    return rgb_values.map((pixel) =>
    {
        let hue, saturation, luminance = 0;

        // i. Change range from 0-255 to 0-1
        let red_opp = pixel.r / 255;
        let green_opp = pixel.g / 255;
        let blue_opp = pixel.b / 255;

        // ii. Find the maximum and minimum values
        const c_max = Math.max(red_opp, green_opp, blue_opp);
        const c_min = Math.min(red_opp, green_opp, blue_opp);

        // iii. Calculate the difference between the maximum and minimum values
        const difference = c_max - c_min;

        // iv. Calculate the luminance
        luminance = (c_max + c_min) / 2;

        // v. Calculate the saturation
        if (luminance <= 0.5)
        {
            saturation = difference / (c_max + c_min);
        } else if (luminance >= 0.5)
        {
            saturation = difference / (2.0 - c_max - c_min);
        }

        // vi. Calculate the hue
        /**
         * If Red is max, then Hue = (G - B) / (Max - Min)
         * If Green is max, then Hue = 2.0 + (B - R) / (Max - Min)
         * If Blue is max, then Hue = 4.0 + (R - G) / (Max - Min)
         */

        const max_color_value = Math.max(pixel.r, pixel.g, pixel.b);

        if (max_color_value === pixel.r)
        {
            hue = (green_opp - blue_opp) / difference;
        } else if (max_color_value === pixel.g)
        {
            hue = 2.0 + (blue_opp - red_opp) / difference;
        } else
        {
            hue = 4.0 + (red_opp - green_opp) / difference;
        }

        // vii. Convert hue to degrees
        hue = hue * 60;

        // viii. Convert negative hues to positive hues
        if (hue < 0)
        {
            hue = hue + 360;
        }

        if (difference === 0)
        {
            return false;
        }

        return {
            h: Math.round(hue) + 180,
            s: parseFloat(saturation * 100).toFixed(2),
            l: parseFloat(luminance * 100).toFixed(2),
        };
    });
}

// Utility 3 - Convert RGB to HEX
// Convert each pixel value (number) to hex (string) with base 16
const rgb_to_hex = (pixel) =>
{
    const component_to_hex = (component) =>
    {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return ("#" + component_to_hex(pixel.r) + component_to_hex(pixel.g) + component_to_hex(pixel.b)).toUpperCase();
}


// **** 5. Build the palette
const build_palette = (colors_list) =>
{
    const pallete_container = document.getElementById('palette');
    const complementary_container = document.getElementById('complementary');

    // 1. Reset the HTML content
    pallete_container.innerHTML = '';
    complementary_container.innerHTML = '';

    const ordered_by_color = order_by_luminance(colors_list);
    const hsl_colors = convert_rgb_to_hsl(ordered_by_color);

    for (let i = 0; i < hsl_colors.length; i++)
    {

        const hex_color = rgb_to_hex(ordered_by_color[i]);
        const hex_color_complementary = hsl_to_hex(hsl_colors[i]);

        if (i > 0)
        {
            const difference = calculate_color_difference(ordered_by_color[i], ordered_by_color[i - 1]);

            // If the difference is too small, we don't want to show it
            if (difference < 120)
            {
                continue;
            }
        }

        // 2. Create the div and text elements for both colors and append it to the document
        const color_element = document.createElement('div');
        color_element.style.backgroundColor = hex_color;
        color_element.appendChild(document.createTextNode(hex_color));
        pallete_container.appendChild(color_element);

        // True when hsl color is not black/white/grey
        if (hsl_colors[i].h)
        {
            const complementary_element = document.createElement('div');
            complementary_element.style.backgroundColor = `hsl(${ hsl_colors[i].h }, ${ hsl_colors[i].s }%, ${ hsl_colors[i].l }%)`;
            complementary_element.appendChild(document.createTextNode(hex_color_complementary));
            complementary_container.appendChild(complementary_element);
        }

    }
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



// ''
// TODO: Integrate this function to order the colors by frequency
// // **** Order colors by frequency
// // const order_colors_by_frequency = (colors) =>
// // {
// //     const color_frequency = {};

// //     colors.forEach((color) =>
// //     {
// //         if (color_frequency[color])
// //         {
// //             color_frequency[color] += 1;
// //         }
// //         else
// //         {
// //             color_frequency[color] = 1;
// //         }
// //     });

// //     return Object.entries(color_frequency).sort((a, b) =>
// //     {
// //         return b[1] - a[1];
// //     });
// // }

// ''