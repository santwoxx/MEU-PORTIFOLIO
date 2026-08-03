 bconst fs = require('fs');
const https = require('https');

https.get('https://registry.inspira-ui.com/fluid-cursor.json', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const json = JSON.parse(data);
        const vueCode = json.files[0].content;
        
        let tsCode = vueCode.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
        
        // Remove vue imports
        tsCode = tsCode.replace(/import type \{ HTMLAttributes \} from "vue";/, '');
        tsCode = tsCode.replace(/import \{ cn \} from "@inspira-ui\/plugins";/, '');
        tsCode = tsCode.replace(/import \{ onMounted, ref, watch \} from "vue";/, '');
        
        // Remove Vue Props definition
        tsCode = tsCode.replace(/const props = withDefaults\(defineProps<Props>\(\), \{[\s\S]*?\}\);/, `
        const props = {
            simResolution: 128,
            dyeResolution: 1440,
            captureResolution: 512,
            densityDissipation: 3.5,
            velocityDissipation: 2,
            pressure: 0.1,
            pressureIterations: 20,
            curl: 3,
            splatRadius: 0.2,
            splatForce: 6000,
            shading: true,
            colorUpdateSpeed: 10,
            backColor: { r: 0.5, g: 0, b: 0 },
            transparent: true,
        };
        `);

        // Replace ref and onMounted
        tsCode = tsCode.replace(/const canvasRef = ref<HTMLCanvasElement \| null>\(null\);/, '');
        tsCode = tsCode.replace(/onMounted\(\(\) => \{/, 'function initFluid() {');
        tsCode = tsCode.replace(/const canvas = canvasRef\.value;/, 'const canvas = document.getElementById("fluid-canvas") as HTMLCanvasElement;');
        
        // Remove Vue watchers
        tsCode = tsCode.replace(/\/\/ Add watchers for prop changes[\s\S]*/, '');
        
        // Append initialization call
        tsCode += `
        // Start the animation
        updateFrame();
        }
        
        window.addEventListener('DOMContentLoaded', initFluid);
        `;
        
        fs.writeFileSync('fluid-cursor.ts', tsCode);
        console.log('fluid-cursor.ts created');
    });
});
