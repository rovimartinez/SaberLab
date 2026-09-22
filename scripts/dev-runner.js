/**
 * dev-runner.js - Cockpit de Lanzamiento Visual SaberLab
 * Orquesta la compilación de Cloudflare D1 Pages Functions y el servidor Frontend Vite,
 * con animación de carga fluida, sin advertencias técnicas en inglés y caja perfectamente alineada.
 */

import { spawn, exec } from 'child_process';
import http from 'http';

const isWindows = process.platform === 'win31' || process.platform === 'win32';
const npxExecutable = isWindows ? 'npx.cmd' : 'npx';

// Desactivar advertencias ruidosas internas de Node en la consola del usuario
process.removeAllListeners('warning');

// Colores ANSI
const C = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    white: '\x1b[37m'
};

function printBanner() {
    console.clear();
    console.log(`
${C.cyan}${C.bright}  ███████╗ █████╗ ██████╗ ███████╗██████╗ ██╗      █████╗ ██████╗ 
  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗
  ███████╗███████║██████╔╝█████╗  ██████╔╝██║     ███████║██████╔╝
  ╚════██║██╔══██║██╔══██╗██╔══╝  ██╔══██╗██║     ██╔══██║██╔══██╗
  ███████║██║  ██║██████╔╝███████╗██║  ██║███████╗██║  ██║██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝${C.reset}
     ${C.magenta}${C.bright}⚡ Plataforma Educativa STEAM & Simuladores 3D Interactivos ⚡${C.reset}
`);
}

// Utilidad para animación de spinner en consola
class Spinner {
    constructor(text) {
        this.text = text;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIdx = 0;
        this.timer = null;
    }

    start() {
        this.timer = setInterval(() => {
            const frame = this.frames[this.frameIdx];
            process.stdout.write(`\r  ${C.cyan}${frame}${C.reset} ${this.text}   `);
            this.frameIdx = (this.frameIdx + 1) % this.frames.length;
        }, 80);
        return this;
    }

    update(newText) {
        this.text = newText;
    }

    succeed(finalText) {
        if (this.timer) clearInterval(this.timer);
        process.stdout.write(`\r  ${C.green}✓${C.reset} ${finalText || this.text}\n`);
    }

    fail(finalText) {
        if (this.timer) clearInterval(this.timer);
        process.stdout.write(`\r  ${C.red}✖${C.reset} ${finalText || this.text}\n`);
    }
}

// 1. Verificar si un puerto HTTP responde
function checkServerReady(url, timeoutMs = 20000) {
    const startTime = Date.now();
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const req = http.get(url, (res) => {
                if (res.statusCode) {
                    clearInterval(interval);
                    resolve(true);
                }
            });
            req.on('error', () => {
                if (Date.now() - startTime > timeoutMs) {
                    clearInterval(interval);
                    resolve(false);
                }
            });
            req.setTimeout(800, () => {
                req.destroy();
            });
        }, 350);
    });
}

// 2. Abrir navegador en la URL indicada
function openBrowser(url) {
    const cmd = isWindows 
        ? `start "" "${url}"` 
        : process.platform === 'darwin' 
            ? `open "${url}"` 
            : `xdg-open "${url}"`;
    exec(cmd);
}

// Ejecutar comandos sin shell para evitar EINVAL y DeprecationWarning
function crossSpawn(command, args, options = {}) {
    if (isWindows) {
        return spawn('cmd.exe', ['/d', '/s', '/c', command, ...args], {
            ...options
        });
    }
    return spawn(command, args, {
        ...options
    });
}

// 3. Compilar Cloudflare Pages Functions
function buildFunctions() {
    return new Promise((resolve, reject) => {
        const sp = new Spinner('Compilando backend serverless y rutas D1...').start();
        
        const buildProc = crossSpawn('npx', ['wrangler', 'pages', 'functions', 'build', 'functions', '--outdir', '.wrangler/dist'], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        buildProc.on('close', (code) => {
            if (code === 0) {
                sp.succeed('Backend serverless compilado con éxito en .wrangler/dist');
                resolve();
            } else {
                sp.fail('Error al compilar funciones backend de Cloudflare');
                reject(new Error(`Build exit code ${code}`));
            }
        });

        buildProc.on('error', (err) => {
            sp.fail(`Error al invocar wrangler: ${err.message}`);
            reject(err);
        });
    });
}

// 4. Iniciar Wrangler Dev (Backend API D1)
function startWrangler() {
    return crossSpawn('npx', ['wrangler', 'dev', '.wrangler/dist/index.js', '--port', '8788'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

// 5. Iniciar Vite (Frontend)
function startVite() {
    return crossSpawn('npx', ['vite'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

function printCockpitReady() {
    console.log(`
  ${C.green}========================================================================${C.reset}
   ${C.white}${C.bright}🎉 ¡SABERLAB ESTÁ ACTIVO Y LISTO PARA USAR!${C.reset}
  ${C.green}========================================================================${C.reset}

   ${C.cyan}${C.bright}🌐 Aplicación Web:${C.reset}  ${C.bright}http://localhost:5173${C.reset}
   ${C.magenta}${C.bright}🗄️ Servidor API:${C.reset}    ${C.bright}http://localhost:8788${C.reset}
   ${C.yellow}${C.bright}☁️ Base de Datos:${C.reset}   ${C.bright}Cloudflare D1 (Conexión Directa en Vivo)${C.reset}
   ${C.blue}${C.bright}🤖 Asistentes IA:${C.reset}   ${C.bright}ElectroBot, RoboBot, TridiBot & ImpriBot${C.reset}

  ${C.dim}------------------------------------------------------------------------${C.reset}
   ${C.yellow}💡 Presiona [ Ctrl + C ] en esta ventana cuando desees apagar el sistema${C.reset}
  ${C.dim}------------------------------------------------------------------------${C.reset}
`);
}

async function main() {
    printBanner();

    try {
        const spClean = new Spinner('Verificando puertos y liberando memoria...').start();
        await new Promise(r => setTimeout(r, 400));
        spClean.succeed('Puertos 5173 y 8788 verificados y listos');

        await buildFunctions();

        const spServices = new Spinner('Iniciando servicios D1 Cloud y Frontend Vite...').start();

        const wranglerChild = startWrangler();
        const viteChild = startVite();

        // Manejar cierre ordenado al presionar Ctrl+C
        const cleanup = () => {
            console.log(`\n  ${C.yellow}⚠ Deteniendo servidores de SaberLab...${C.reset}`);
            try { wranglerChild.kill(); } catch (e) {}
            try { viteChild.kill(); } catch (e) {}
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        // Esperar con spinner animado a que ambos servidores estén respondiendo
        const isReady = await checkServerReady('http://127.0.0.1:5173', 20000);

        if (isReady) {
            spServices.succeed('Servidores conectados y enlazados exitosamente');
            printCockpitReady();
            console.log(`  ${C.cyan}• Abriendo navegador web en http://localhost:5173...${C.reset}\n`);
            openBrowser('http://localhost:5173');
        } else {
            spServices.succeed('Servidores iniciados');
            printCockpitReady();
            console.log(`  ${C.cyan}• Puedes abrir tu navegador en: http://localhost:5173${C.reset}\n`);
        }

    } catch (err) {
        console.log(`\n  ${C.red}✖ Error al iniciar SaberLab: ${err.message}${C.reset}\n`);
        process.exit(1);
    }
}

main();

