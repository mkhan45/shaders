float circleSDF(in vec2 p) {
    return 1.0 - length(p);
}

float circleFill(in vec2 p, float s, float e) {
    return smoothstep(s, e, circleSDF(p));
}

float circleOutline(in vec2 p, float w, float s, float e) {
    return smoothstep(e, s, abs(circleSDF(p)) - w);
}

float semicircleOutline(in vec2 p, float w, float s, float e) {
    return max(0.0, -p.y) * smoothstep(e, s, abs(circleSDF(p)) - w);
}

float dirFromBitmask(uint mask, uint bit) {
    uint val = (mask >> bit) & 1u;
    return float(int(val) * 2 - 1);
}

float smiley2(in vec2 p, int n) {
    // gotta fake recursion
    float res = 0.0;
    
    for (int depth = 0, ncols = 1; depth < n; depth += 1, ncols *= 2) {
        for (int col = 0; col < ncols; col += 1) {
            // gotta be an analytical way to do this?
            // feel like i am missing something inherent about binary -- bc offset scale exponented by bits but that's how numbers work,
            // something about how each binary digit shifts value on number line
            // - the main difference is the change in direction but if u know the depth then pretend ur starting in the middle
            // - basically a huffman coding
            // - https://static.mikail-khan.com/huffman_line.png
            // - but the resulting points we want aren't equally spaced??
            // - probably because the "base" (exponent) is fractional, but we're still using binary?
            //     - https://en.wikipedia.org/wiki/Non-integer_base_of_numeration
            //     - so we are converting from our binary non int base to float ?
            //     - but why are the points not equally spaced?
            //         - i guess they would be with infinite digits
            //         - so we are discovering the points of a non integer base with a certain length
            //     - so is there a loop-free way to decode non int base? probably not?
            // might be a cool way with modular arith
            
            uint posBitmask = uint(col);

            vec2 p = p;
            float smileY = p.y;
            float scaleFac = 0.35;
            for (int i = 0; i < depth; i += 1, scaleFac *= 0.35) {
                float dir = dirFromBitmask(posBitmask, uint(i));
                float spacing = 1.25;
                float xshift = dir * scaleFac * spacing;
                
                p += vec2(xshift, -0.65 * scaleFac);
                
                // could calculate analytically but might not be faster
                // https://www.wolframalpha.com/input?i=sum+a*b%5Ex%2C+x+from+0+to+n
                // https://stackoverflow.com/questions/39446306/glsl-pow-vs-multiplication-for-integer-exponent
                smileY -= 0.65 * scaleFac;
            }
            
            scaleFac /= 0.35;
            
            vec2 smileP = vec2(p.x, smileY + 0.275 * scaleFac);
            smileP /= scaleFac * 0.5;
            smileP.x /= 1.3;
            
            p /= scaleFac; // have to run scaling after offset bc the offsets are scaled individually
            res += circleOutline(p, 0.01, 0.0, 0.01);
            
            res += semicircleOutline(smileP, 0.01, 0.0, 0.01);
        }
    }
    
    return res;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord - iResolution.xy / 2.0)/iResolution.y;
    float t = fract(iTime * 0.5) * 0.7;
    
    // 1. set goal_uv to position of top left or right eye
    // 2. lerp towards goal_uv
    // 3. maybe not linear, prob gotta exp time by scaling factor or smth?
    vec2 goal_uv = vec2(0.0);

    // Time varying pixel color
    vec3 col = vec3(0.0);
    
    vec2 circle_uv = uv / 0.5;
    col += vec3(1.0, 0.0, 0.0) * smiley2(circle_uv, 9);

    // Output to screen
    fragColor = vec4(col,1.0);
}
