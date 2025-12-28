const btnInicio = document.getElementById("btnInicio");
const pantallaInicio = document.getElementById("pantallaInicio");
const pantallaCorazon = document.getElementById("pantallaCorazon");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function ajustarCanvas() {
    const size = Math.min(window.innerWidth * 0.9, 420);
    canvas.width = size;
    canvas.height = size;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

const texto = "Val";

// Ajustes finos (NO TOCAR)
const paso = 0.145;
const escala = 150;
const velocidadFilas = 5;
const fadeSpeed = 0.03;

// Estados
let filas = [];
let filaActual = 0;
let ultimoTiempo = 0;
let letrasActivas = [];
let corazonCompleto = false;
let tiempoPulso = 0;
let latidoPrevio = 0;

ctx.fillStyle = "red";
ctx.font = "16px Arial";
ctx.textAlign = "center";

// Botón
btnInicio.addEventListener("click", () => {
    pantallaInicio.classList.add("oculto");
    pantallaCorazon.classList.remove("oculto");
    prepararFilas();
    requestAnimationFrame(animar);
});

// Corazón implícito (relleno correcto)
function dentroCorazon(x, y) {
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y <= 0;
}

// Precalcular filas
function prepararFilas() {
    filas = [];
    filaActual = 0;
    letrasActivas = [];
    corazonCompleto = false;
    tiempoPulso = 0;

    for (let y = 1.3; y >= -1.3; y -= paso) {
        let fila = [];

        for (let x = -1.3; x <= 1.3; x += paso) {
            if (dentroCorazon(x, y)) {
                fila.push({
                    x,
                    y,
                    alpha: 0,
                    scale: 0.6,                 // inicio “respirando”
                    delay: Math.random() * 8
                });
            }
        }

        if (fila.length > 0) filas.push(fila);
    }
}

// Loop principal
function animar(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Activar filas progresivamente
    if (
        filaActual < filas.length &&
        timestamp - ultimoTiempo > 1000 / velocidadFilas
    ) {
        letrasActivas.push(...filas[filaActual]);
        filaActual++;
        ultimoTiempo = timestamp;
    }

    dibujarLetras();

    // Detectar fin
    if (
        filaActual >= filas.length &&
        letrasActivas.every(l => l.alpha >= 1)
    ) {
        corazonCompleto = true;
        mostrarMensaje();
    }

    requestAnimationFrame(animar);
}

// Dibujar con respiración + pulso final
function dibujarLetras() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Pulso global (solo cuando está completo)
    let pulso = 1;
    if (corazonCompleto) {
        tiempoPulso += 0.05;
        const seno = Math.sin(tiempoPulso);
        pulso = 1 + seno * 0.02;

        // Detectar pico del latido
        if (seno > 0.98 && latidoPrevio <= 0.98) {
            if (navigator.vibrate) {
                navigator.vibrate(20); // vibración sutil
            }
        }

        latidoPrevio = seno;
    }


    letrasActivas.forEach(l => {
        if (l.delay > 0) {
            l.delay--;
            return;
        }

        // Fade-in
        if (l.alpha < 1) l.alpha += fadeSpeed;

        // Respiración individual
        if (l.scale < 1) l.scale += 0.02;

        ctx.save();
        ctx.globalAlpha = Math.min(l.alpha, 1);

        ctx.translate(
            cx + l.x * escala * pulso,
            cy - l.y * escala * pulso
        );
        ctx.scale(l.scale * pulso, l.scale * pulso);

        ctx.fillText(texto, 0, 0);
        ctx.restore();
    });

    ctx.globalAlpha = 1;
}

function mostrarMensaje() {
    document
        .getElementById("mensajeFinal")
        .classList.add("mostrar");
}
