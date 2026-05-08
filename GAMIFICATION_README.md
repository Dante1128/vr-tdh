# 🎮 Mecánicas de Gamificación — FocusClass
### Entorno Virtual 3D para Niños con TDAH (5–12 años)

---

## Índice

1. [Visión general](#visión-general)
2. [Principios de diseño](#principios-de-diseño)
3. [Arquitectura del entorno virtual](#arquitectura-del-entorno-virtual)
4. [Objetivos clínicos y su traducción en mecánicas](#objetivos-clínicos-y-su-traducción-en-mecánicas)
5. [Catálogo de tareas](#catálogo-de-tareas)
6. [Sistema de puntos](#sistema-de-puntos)
7. [Sistema de insignias](#sistema-de-insignias)
8. [Sistema de progresión y desbloqueos](#sistema-de-progresión-y-desbloqueos)
9. [Adaptabilidad dinámica](#adaptabilidad-dinámica)
10. [Flujo de una sesión](#flujo-de-una-sesión)
11. [Panel de supervisión](#panel-de-supervisión)
12. [Métricas clínicas registradas](#métricas-clínicas-registradas)
13. [Consideraciones de diseño para TDAH](#consideraciones-de-diseño-para-tdah)

---

## Visión general

**FocusClass** es un entorno virtual 3D que simula un aula escolar y que utiliza mecánicas de gamificación para trabajar los tres síntomas nucleares del TDAH en niños:

| Síntoma objetivo | Mecánica principal |
|---|---|
| Déficit de atención | Tareas con foco sostenido y distractores graduales |
| Impulsividad | Tareas de inhibición de respuesta con penalización |
| Hiperactividad | Tareas de quietud y secuenciación con recompensa |

La gamificación **no es decorativa**: cada punto, insignia y desbloqueo es consecuencia directa de un comportamiento clínicamente relevante. El sistema recompensa el proceso (esfuerzo, constancia) tanto como el resultado (acierto, completitud).

---

## Principios de diseño

### 1. Las tareas son la gamificación
Las mecánicas de juego no existen separadas de las actividades terapéuticas. Los puntos, insignias y niveles emergen del desempeño del niño en tareas diseñadas con criterio clínico. No hay minijuegos desconectados del objetivo.

### 2. Recompensa inmediata
Los niños con TDAH tienen dificultad para conectar esfuerzo presente con recompensa futura. Toda acción positiva recibe retroalimentación visual y sonora en menos de 500ms (animación de puntos, efecto de sonido, cambio de color del ambiente).

### 3. Sesiones cortas y estructuradas
Cada sesión dura entre 15 y 25 minutos. Las tareas individuales nunca superan los 5 minutos. El entorno usa una estructura fija: bienvenida → tareas → cierre con recompensa, para generar predictibilidad y reducir la ansiedad.

### 4. Fracaso no punitivo
Los errores generan retroalimentación neutral ("¡Vuelve a intentarlo!"), no castigo emocional. La penalización de puntos se aplica solo en tareas de impulsividad, donde el costo es parte del aprendizaje de inhibición, y siempre con explicación visual al niño.

### 5. Control supervisado
El psicólogo asigna las tareas y ajusta la dificultad. El tutor acompaña la sesión. El niño juega. Esta separación de roles garantiza que la gamificación no reemplace el criterio clínico.

---

## Arquitectura del entorno virtual

El entorno es un **aula escolar 3D** renderizada en tiempo real. Está compuesta por zonas funcionales que se desbloquean progresivamente:

```
MAPA DEL ENTORNO
─────────────────────────────────────────────
  [AULA PRINCIPAL]          ← zona inicial, siempre disponible
       │
       ├── [PIZARRÓN]       ← tareas de atención y memoria
       ├── [PUPITRE]        ← tareas de calma y secuenciación
       ├── [MOCHILA]        ← tareas de organización e impulsividad
       │
  [PATIO]                   ← desbloqueo nivel 2 (150 pts)
       │
       ├── [ZONA DE JUEGO]  ← actividades de regulación motora
       ├── [BANCO DE LECTURA] ← tareas de atención sostenida
       │
  [BIBLIOTECA]              ← desbloqueo nivel 3 (350 pts)
       │
       └── [LABORATORIO]   ← desbloqueo nivel 4 (600 pts)
─────────────────────────────────────────────
```

Cada zona nueva es un incentivo de progresión que el niño puede ver "bloqueada" con un candado visual desde el inicio, generando motivación anticipatoria.

---

## Objetivos clínicos y su traducción en mecánicas

### Atención sostenida
**Base neurocientífica:** La corteza prefrontal regula la atención top-down. En TDAH hay hipoactivación de este circuito. Las tareas de atención sostenida estimulan este sistema mediante demanda de foco prolongado con distractores controlados.

**Traducción en mecánica:**
- Tareas con ventana de tiempo explícita (barra de tiempo visible)
- Distractores ambientales en el aula (sonidos, objetos en movimiento) que aumentan gradualmente
- Puntuación bonus por completar sin cometer errores de distracción
- El avatar del niño tiene un indicador de "nivel de foco" visible que sube cuando está en tarea

### Inhibición de respuesta (impulsividad)
**Base neurocientífica:** La impulsividad en TDAH se asocia a disfunción en el circuito de control inhibitorio (corteza prefrontal inferior y núcleo subtalámico). Entrenar la espera activa fortalece este circuito.

**Traducción en mecánica:**
- Tareas con señal de "ESPERA" antes de permitir la acción
- Tiempo de espera variable (2–6 segundos) para evitar que el niño memorice el patrón
- Respuesta prematura genera pérdida de turno, no de puntos totales (para evitar frustración excesiva)
- Retroalimentación inmediata: animación de "¡Bien esperado!" con efecto visual en el avatar

### Regulación de hiperactividad
**Base neurocientífica:** La hiperactividad motora en TDAH se relaciona con exceso de actividad dopaminérgica en el estriado. Las pausas estructuradas y la conciencia corporal ayudan a desarrollar autorregulación.

**Traducción en mecánica:**
- Tareas que requieren que el avatar permanezca quieto por períodos cortos (30–90 segundos)
- Uso de un "medidor de calma" visual (barra que sube con quietud, baja con movimiento excesivo)
- Pausas de respiración integradas entre tareas (animación de 30 segundos guiada)
- Recompensa progresiva: cada 10 segundos quieto suma puntos, reforzando la constancia

---

## Catálogo de tareas

### Bloque A — Atención

#### A1: Encuentra el objeto
- **Escenario:** Aula principal
- **Descripción:** El profesor virtual menciona verbalmente un objeto que está escondido en el aula. El niño debe encontrarlo haciendo clic sobre él, ignorando objetos distractores que también se mueven o iluminan.
- **Duración:** 2–4 minutos
- **Dificultad base:** 3 objetos distractores
- **Escalado:** +2 distractores por nivel, velocidad de movimiento aumenta
- **Puntos:** +10 base, +5 bonus por no hacer clic en distractores
- **Métrica registrada:** Número de clics en distractores, tiempo hasta encontrar el objeto

#### A2: Copia el pizarrón
- **Escenario:** Pizarrón del aula
- **Descripción:** El pizarrón muestra una lista de 3–5 tareas escolares durante un tiempo limitado. Al ocultarse, el niño debe completarlas en el orden correcto seleccionándolas de una lista revuelta.
- **Duración:** 3–5 minutos
- **Dificultad base:** 3 ítems, 10 segundos de visualización
- **Escalado:** +1 ítem por nivel, -2 segundos de visualización
- **Puntos:** +15 base, +5 bonus por orden correcto completo
- **Métrica registrada:** Ítems recordados, errores de secuencia, tiempo de respuesta

#### A3: Escucha al profesor
- **Escenario:** Aula con profesor virtual activo
- **Descripción:** El profesor da una instrucción oral con varios pasos ("Primero saca el cuaderno, luego abre en la página 5, después escribe tu nombre"). El niño ejecuta los pasos en su pupitre virtual.
- **Duración:** 3–5 minutos
- **Dificultad base:** 2 pasos
- **Escalado:** +1 paso por nivel
- **Puntos:** +12 por instrucción completada correctamente
- **Métrica registrada:** Pasos omitidos, pasos en orden incorrecto

---

### Bloque B — Impulsividad

#### B1: Levanta la mano
- **Escenario:** Aula con compañeros virtuales
- **Descripción:** El profesor hace preguntas a la clase. El niño debe esperar a que aparezca el ícono de "mano levantada" antes de hacer clic para responder. Los compañeros virtuales responden antes si el niño es impulsivo, haciendo que pierda el turno.
- **Duración:** 3–5 minutos
- **Señal de espera:** Variable entre 2 y 6 segundos
- **Dificultad base:** Señal clara y visible
- **Escalado:** Señal más pequeña y breve, compañeros responden más rápido
- **Puntos:** +10 por respuesta correctamente esperada, -5 por respuesta prematura
- **Métrica registrada:** Número de respuestas prematuras, tiempo promedio de espera

#### B2: Ordena la mochila
- **Escenario:** Mochila del pupitre
- **Descripción:** Aparecen 6–10 objetos escolares al mismo tiempo. El niño debe guardarlos en la mochila uno por uno en el orden que indica una lista en pantalla. Si intenta tomar el siguiente objeto antes de soltar el anterior, el objeto regresa a su lugar.
- **Duración:** 3–4 minutos
- **Dificultad base:** 6 objetos, orden indicado claramente
- **Escalado:** +2 objetos, orden indicado brevemente y luego oculto
- **Puntos:** +12 por mochila completa, estrella de precisión si no hay errores
- **Métrica registrada:** Objetos tomados fuera de orden, intentos fallidos por impulsividad

#### B3: Semáforo del recreo
- **Escenario:** Puerta del aula hacia el patio
- **Descripción:** El semáforo de la puerta cambia de rojo a verde aleatoriamente. El niño debe esperar el verde para que su avatar salga al recreo. Si sale en rojo, vuelve al inicio y pierde la ronda.
- **Duración:** 2–3 minutos
- **Dificultad base:** Verde dura 3 segundos, ciclo de 8 segundos
- **Escalado:** Verde dura 1.5 segundos, ciclos más irregulares
- **Puntos:** +8 por salida correcta, racha x2 si logra 3 correctas seguidas
- **Métrica registrada:** Salidas en rojo, tiempo de reacción al verde

---

### Bloque C — Hiperactividad / Regulación motora

#### C1: Hora de clase
- **Escenario:** Pupitre del aula
- **Descripción:** El profesor virtual da una clase de 60–90 segundos. El avatar del niño debe permanecer sentado y quieto. El movimiento del mouse/joystick innecesario activa el "medidor de inquietud". Si el medidor se llena, la clase se interrumpe.
- **Duración:** 2–3 minutos
- **Dificultad base:** Medidor se llena lentamente, clase de 60 segundos
- **Escalado:** Clase más larga, medidor más sensible
- **Puntos:** +8 por cada 15 segundos quieto, insignia "Alumno del día" si completa sin interrupciones
- **Métrica registrada:** Movimientos innecesarios por minuto, interrupciones totales

#### C2: Examen silencioso
- **Escenario:** Aula durante un examen
- **Descripción:** El niño resuelve 3–5 ejercicios simples (sumas, palabras incompletas) en su cuaderno virtual. Los compañeros virtuales también hacen el examen. Si el avatar del niño interrumpe (hace clic fuera del área de trabajo), los compañeros se distraen y aparece el profesor reprendiendo, perdiendo puntos.
- **Duración:** 4–5 minutos
- **Dificultad base:** Ejercicios simples, área de trabajo amplia
- **Escalado:** Ejercicios más complejos, área más pequeña, más compañeros distractores
- **Puntos:** +20 por examen completado, +10 bonus si no hay interrupciones
- **Métrica registrada:** Clics fuera del área, tiempo total en tarea vs. fuera de tarea

#### C3: Pausa activa guiada
- **Escenario:** Zona de juego del patio (desbloqueable)
- **Descripción:** Entre tareas exigentes, el entorno propone una pausa activa de 90 segundos. El avatar del niño realiza movimientos guiados en pantalla (estiramiento, respiración). El niño los replica usando el sensor de movimiento o siguiendo con el mouse. Completar la pausa llena una barra de "energía recargada" que da bonus en la siguiente tarea.
- **Duración:** 90 segundos
- **Función:** Regulación entre tareas, no puntuación directa
- **Efecto de juego:** Bonus +15% en puntos de la siguiente tarea completada
- **Métrica registrada:** Pausas completadas vs. saltadas

---

## Sistema de puntos

### Estructura base

```
ACCIÓN                              PUNTOS
────────────────────────────────────────────
Completar tarea (cualquier bloque)  +8 a +20 según dificultad
Bonus sin errores                   +5 a +10 adicionales
Racha (3 tareas seguidas bien)      ×1.5 multiplicador
Espera correcta (bloque B)          +10
Respuesta prematura (bloque B)      -5
Completar sesión completa           +30 bonus de sesión
Pausa activa completada             +15% en siguiente tarea
────────────────────────────────────────────
```

### Acumulación entre sesiones

Los puntos se acumulan en un perfil persistente del niño. El progreso es visible para el niño (pantalla de perfil con avatar que "crece" con los puntos), para el tutor (panel de seguimiento) y para el psicólogo (dashboard clínico).

### Niveles de experiencia

| Nivel | Nombre | Puntos requeridos | Desbloqueo |
|---|---|---|---|
| 1 | Estudiante nuevo | 0 – 149 | Aula principal |
| 2 | Alumno atento | 150 – 349 | Patio de recreo |
| 3 | Explorador curioso | 350 – 599 | Biblioteca |
| 4 | Maestro del foco | 600+ | Laboratorio |

---

## Sistema de insignias

Las insignias son reconocimientos por comportamientos conductuales específicos, no solo por acumulación de puntos. Son visibles en el perfil del niño y compartibles con el tutor.

### Insignias de atención

| Insignia | Condición |
|---|---|
| 👁️ Ojos de lince | Completar A1 sin clic en distractores 3 veces seguidas |
| 📋 Memoria de elefante | Recordar todos los ítems del pizarrón (A2) correctamente |
| 👂 Súper oyente | Completar A3 con todos los pasos en orden correcto |
| 🔥 En llamas | Racha de 5 tareas de atención sin errores |

### Insignias de impulsividad

| Insignia | Condición |
|---|---|
| ✋ Mano paciente | Esperar correctamente en B1 durante 10 turnos seguidos |
| 🎒 Organizado total | Completar B2 sin errores de orden 3 sesiones seguidas |
| 🚦 Rey del semáforo | Lograr 5 salidas correctas seguidas en B3 |
| 🧘 Control total | Cero respuestas prematuras en una sesión completa |

### Insignias de regulación

| Insignia | Condición |
|---|---|
| 🪑 Alumno del día | Completar C1 sin interrupciones |
| 📝 Examinado de oro | Completar C2 con bonus de silencio |
| 💪 Energía recargada | Completar 5 pausas activas (C3) en distintas sesiones |
| ⭐ Semana perfecta | Completar sesión todos los días de una semana |

---

## Sistema de progresión y desbloqueos

### Escenarios desbloqueables

El desbloqueo de nuevas zonas del entorno funciona como el motivador principal de largo plazo. Cada zona nueva incluye variantes de las tareas del catálogo adaptadas al contexto del escenario.

**Patio de recreo (150 pts)**
Versiones de las tareas en contexto de recreo: el semáforo (B3), la pausa activa (C3), y versiones lúdicas de atención con compañeros virtuales jugando.

**Biblioteca (350 pts)**
Tareas de atención sostenida de mayor duración. Lectura guiada con preguntas de comprensión. El ambiente es más silencioso, lo que aumenta la exigencia de quietud.

**Laboratorio (600 pts)**
Tareas de secuenciación complejas (experimentos paso a paso). Mayor demanda de inhibición de respuesta. Introducción de tareas colaborativas con un compañero virtual.

### Avatar personalizable

A medida que el niño acumula puntos e insignias, puede personalizar la apariencia de su avatar (ropa, accesorios escolares, colores). Esta personalización es estrictamente cosmética y funciona como recompensa secundaria de largo plazo.

---

## Adaptabilidad dinámica

### Ajuste manual (psicólogo)

Desde el panel del psicólogo, se puede modificar para cada sesión:

- Número de tareas por bloque (A, B, C)
- Nivel de dificultad de cada tarea (1–5)
- Duración de la sesión (15, 20 o 25 minutos)
- Activar o desactivar distractores ambientales
- Incluir o no pausas activas entre bloques

### Ajuste automático (sistema)

El sistema registra métricas por sesión y sugiere ajustes al psicólogo:

```
SI promedio de errores en bloque B > 60% durante 3 sesiones:
  → Sugerir reducir nivel de dificultad en B1 y B2

SI tiempo promedio de atención < 50% de la tarea durante 2 sesiones:
  → Sugerir reducir duración de tareas del bloque A

SI el niño completa todas las tareas sin errores en 2 sesiones seguidas:
  → Sugerir subir nivel de dificultad general
```

---

## Flujo de una sesión

```
INICIO DE SESIÓN
      │
      ▼
[Psicólogo asigna tareas desde su panel]
  - Selecciona bloques A, B, C
  - Define dificultad por tarea
  - Activa/desactiva pausas
      │
      ▼
[Tutor abre el entorno con el niño]
  - El niño ve su avatar y el aula
  - Pantalla de bienvenida: "Hoy tienes X misiones"
      │
      ▼
[Bienvenida (1–2 min)]
  - El profesor virtual saluda al niño
  - Muestra las insignias ganadas en la sesión anterior
  - Anuncia la misión del día
      │
      ▼
[Bloque de tareas (12–20 min)]
  - Tarea A (atención) → feedback inmediato → puntos
  - Pausa activa opcional (90 seg)
  - Tarea B (impulsividad) → feedback inmediato → puntos
  - Pausa activa opcional (90 seg)
  - Tarea C (regulación) → feedback inmediato → puntos
      │
      ▼
[Cierre de sesión (2–3 min)]
  - Pantalla de resumen: puntos ganados, insignias nuevas
  - Progreso hacia el siguiente nivel/desbloqueo
  - Mensaje motivacional del profesor virtual
      │
      ▼
[Reporte automático]
  - Tutor recibe: resumen de sesión, puntos, observaciones
  - Psicólogo recibe: métricas clínicas detalladas
```

---

## Panel de supervisión

### Vista del tutor

El tutor accede a un panel simplificado que muestra:

- Resumen de la última sesión (puntos, insignias, duración)
- Gráfico de progreso semanal por objetivo (atención, impulsividad, regulación)
- Notificación si el niño no completó una sesión asignada
- Opción de enviar nota al psicólogo desde el panel

### Dashboard del psicólogo

El psicólogo tiene acceso a métricas detalladas:

- Métricas clínicas por sesión y por semana
- Comparación de desempeño entre sesiones (evolución)
- Alertas automáticas si algún indicador empeora por 3 sesiones seguidas
- Herramienta de configuración de tareas para próximas sesiones
- Exportación de reporte en PDF para seguimiento clínico formal

---

## Métricas clínicas registradas

El sistema registra automáticamente las siguientes variables por sesión:

| Métrica | Objetivo clínico | Cómo se mide |
|---|---|---|
| Tiempo en tarea vs. fuera de tarea | Atención | Segundos activos en el área de tarea / total |
| Número de distractores activados | Atención | Clics en elementos no relevantes |
| Errores de secuencia | Atención / función ejecutiva | Pasos fuera de orden en A2, A3, B2 |
| Respuestas prematuras | Impulsividad | Acciones antes de la señal en B1, B3 |
| Tiempo promedio de espera | Impulsividad | ms desde señal hasta respuesta |
| Interrupciones en quietud | Hiperactividad | Movimientos innecesarios por minuto en C1, C2 |
| Sesiones completadas / semana | Adherencia | Sesiones finalizadas vs. asignadas |
| Progresión de dificultad | Mejora global | Nivel promedio de tareas completadas con éxito |

---

## Consideraciones de diseño para TDAH

### Estimulación sensorial controlada
El aula 3D usa paleta de colores cálidos y saturación media. Los distractores son introducidos progresivamente, no de golpe. Los efectos de sonido son breves y no repetitivos para evitar habituación o sobrecarga sensorial.

### Feedback multimodal
Cada acción positiva tiene respuesta visual (animación), sonora (efecto de audio corto) y textual ("¡Bien hecho!"). El feedback triple refuerza el circuito de recompensa dopaminérgico que en TDAH tiene menor sensibilidad basal.

### Carga cognitiva reducida
Las instrucciones de cada tarea son máximo 2 oraciones, presentadas en voz del profesor virtual más texto en pantalla. No hay menús complejos. La interfaz del niño tiene menos de 5 elementos activos visibles a la vez.

### Sesiones predecibles
La estructura de bienvenida → tareas → cierre nunca cambia. Lo que cambia es el contenido de las tareas. Esta predictibilidad reduce la ansiedad de transición, frecuente en niños con TDAH.

### Diseño para el tutor no experto
El tutor no necesita conocimientos clínicos para operar el entorno. Su rol es abrir la sesión, acompañar al niño y leer el resumen. Las decisiones terapéuticas son exclusivamente del psicólogo.

---

*FocusClass — Proyecto desarrollado para Hackathon | Alineado a ODS 3, 4 y 10*
*Población objetivo: Niños con TDAH de 5 a 12 años, Bolivia*
