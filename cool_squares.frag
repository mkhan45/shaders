mat2 rot(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    
    return mat2(c, -s, s, c);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.y;

    // Time varying pixel color
    vec3 col = vec3(0.0);
    
    float grid_scale = 5.0;
    vec2 gv = fract(uv * grid_scale) - 0.5;
    
    col.rg += step(0.4, rot(degrees(iTime / 35.0)) * gv);
    col.rb += step(0.4, -rot(degrees(iTime / 35.0)) * gv);
    

    // Output to screen
    fragColor = vec4(col,1.0);
}
