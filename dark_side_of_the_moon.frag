mat2 rot(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    
    return mat2(c, -s, s, c);
}

float s3_2 = sqrt(3.0)/2.0;

// given a 2d coordinate system, fills it
// with the pink floyd rainbow
vec3 rainbow(vec2 uv) {
    vec3 colors[6];
    colors[0] = vec3(1.0, 0.0, 0.0);
    colors[1] = vec3(1.0, 0.4, 0.0);
    colors[2] = vec3(1.0, 1.0, 0.0);
    colors[3] = vec3(0.4, 1.0, 0.0);
    colors[4] = vec3(0.0, 0.5, 1.0);
    colors[5] = vec3(0.5, 0.0, 0.8);
    
    vec3 col = vec3(0.0);
    
    // iterates over the colors and downwards
    for (int i = 0; i < 6; i += 1) {
        // y_variance is used to animate the color's y position
        float y_variance = sin(uv.x - iTime / 2.0 * fract(float(i) * 6.0) + 2.0) / 12.0;
        float y = 0.5 - float(i) * (1.0 / 6.0) - (0.5 / 6.0) + y_variance;
        col += smoothstep(4.9 / 6.1, 1.0, 1.0 - abs(uv.y - y)) * colors[i];
    }
    
    return col;
}

// produces a smooth horizontal line in the coordinate space
float line(vec2 uv, float width) {
    return smoothstep(1.0 - width, 1.0, 1.0 - abs(uv.y));
}

// https://iquilezles.org/articles/distfunctions2d/
float sdEquilateralTriangle(in vec2 p) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - 1.0;
    p.y = p.y + 1.0/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0, 0.0 );
    return -length(p)*sign(p.y);
}

float sd_triangle_fill(in vec2 p) {
    float d = sdEquilateralTriangle(p);
    return smoothstep(0.08, 0.0, d);
}

float sd_triangle_lines(in vec2 p, in float width) {
    float d = sdEquilateralTriangle(p);
    return 1.0 - smoothstep(0.0, width, abs(d));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // 0.0 is the center
    vec2 uv = (fragCoord - iResolution.xy / 2.0)/iResolution.y;

    vec3 col = vec3(0.0);
    
    vec2 rainbow_uv = uv * rot(radians(10.0 * sqrt(uv.x) + sin(iTime / 2.0)));
    rainbow_uv.y *= 17.5 - sqrt(1.0 + uv.x * 220.0);
    rainbow_uv.y -= 1.0 - sqrt(uv.x);
    col += smoothstep(0., 0.8, rainbow(rainbow_uv) * step(1.0 - 1.0, rainbow_uv.x));

    vec2 line_uv = uv * rot(radians(-10.0));
    line_uv.y -= 0.055 + (sin(line_uv.x + iTime / 2.0) * 0.05) * (abs(line_uv.x) - 0.1);
    col += smoothstep(0.8, 1.0, line(line_uv, 0.025) * step(0.0, -line_uv.x));
    
    // cover the line & rainbow within the triangle
    vec2 triangle_uv = uv * 3.0 + vec2(0.0, 0.25);
    col *= 1.0 - sd_triangle_fill(triangle_uv);
    
    // main triangle lines
    vec3 lines = sd_triangle_lines(triangle_uv, 0.075 + cos(iTime) * 0.02)
                  * vec3(0.7, 0.9, 1.0);
    col += smoothstep(0.0, 0.9, lines);
    
    // thinner triangle lines to make the outer edge sharper
    col += sd_triangle_lines(triangle_uv * 0.95, 0.02);
    
    // triangle connector to the white line
    vec2 spread_uv = (uv * 9.0 + vec2(0.5, -0.4)) * rot(radians(-100.0 + sin(iTime / 2.0)));
    spread_uv.x *= 2.25;
    float spread = sd_triangle_fill(spread_uv) * smoothstep(0.1, -0.2, uv.x);
    col += smoothstep(0.1, 1.0, spread);

    // Output to screen
    fragColor = vec4(col,1.0);
}
