---
title: "Una interfaz UART en VHDL para la Zybo Z7"
description: "Un transmisor y receptor serie descrito en VHDL, con generador de baudios, buffers FIFO y botones con antirrebote, para una tarjeta FPGA Zynq-7000."
lang: es
date: 2021-12-30
permalink: /es/proyectos/uart-vhdl/
translation: /projects/uart-vhdl/
tags: [VHDL, FPGA, Diseño digital, Comunicación serie]
published: true
repository: "https://github.com/jhernandezga/UART-interface"
---

Una UART (receptor-transmisor asíncrono universal) descrita módulo a módulo en VHDL a finales de 2021, con las restricciones de pines para la Digilent Zybo Z7, una tarjeta basada en una FPGA Zynq-7000. El trabajo está en dos repositorios: el [núcleo de la UART](https://github.com/jhernandezga/UART-interface) y una [versión con botones con antirrebote](https://github.com/jhernandezga/UART-DEBOUNCED-interface) para probarla a mano en la tarjeta.

## Qué hace una UART

Una UART envía bytes bit a bit por un solo cable, sin un reloj compartido. Transmisor y receptor solo acuerdan de antemano la velocidad. Cada byte viaja en una trama: la línea en reposo está en alto; un **bit de inicio** la lleva a bajo, siguen ocho **bits de datos**, empezando por el menos significativo, y un **bit de parada** la devuelve a alto (el formato 8N1).

El receptor tiene que reconstruir la temporización del transmisor solo a partir de ese flanco de bajada. Cuenta los ticks de un reloj local 32 veces más rápido que la velocidad de bits: 16 ticks después del flanco está en el centro del bit de inicio, y desde ahí cada 32 ticks cae en el centro del bit siguiente, donde la señal es más estable.

{% include diagrams/uart-frame.html lang='es' caption='<b>Fig. 1</b>Una trama en la línea, con el byte 0x4A. El receptor muestrea cada bit en su centro (puntos azules), contando ticks desde el flanco de bajada del bit de inicio.' %}

## Arquitectura

El diseño se divide en cinco módulos, todos parametrizados con *generics* (bits de datos, duración del bit de parada, divisor del reloj, profundidad de la FIFO):

- **Generador de baudios.** Un contador que se reinicia cada `M` ciclos de reloj y emite un tick de un ciclo. Para 32 ticks por bit a 9600 baudios con el reloj de 125 MHz de la tarjeta:

  ```
  M = f_clk / (32 · baud) = 125 MHz / (32 × 9600) ≈ 407
  ```

  lo que da 9597 baudios, un 0,03 % por debajo del valor nominal, muy dentro de lo que tolera una UART.

- **Receptor.** Una máquina de estados (`idle → start → data → stop`) que espera el flanco de bajada, cuenta 16 ticks hasta el centro del bit de inicio y luego 32 ticks por bit, desplazando cada muestra a un registro. Activa `rx_done_tick` durante un ciclo cuando termina el bit de parada.
- **Transmisor.** La imagen especular: mantiene la línea en alto, envía el bit de inicio, desplaza los ocho bits de datos y el bit de parada, y activa `tx_done_tick` al completar la trama.
- **Dos buffers FIFO.** Buffers circulares de 16 bytes con punteros de lectura y escritura y banderas `full` / `empty`. La FIFO de recepción guarda los bytes que llegan hasta que el usuario los lee; la de transmisión encola los bytes por enviar, y el transmisor arranca siempre que no esté vacía.

<figure>
  <img src="{{ '/assets/images/projects/uart/rtl-uart.png' | relative_url }}" alt="Esquema RTL: un generador de baudios que alimenta un receptor y un transmisor; el receptor escribe en una FIFO de recepción y el transmisor lee de una FIFO de transmisión." loading="lazy">
  <figcaption><b>Fig. 2</b>Esquema RTL del núcleo UART en Vivado: generador de baudios, receptor y transmisor, cada uno con su FIFO.</figcaption>
</figure>

El corazón del receptor es el estado de datos: esperar un periodo de bit completo, tomar la muestra, desplazarla desde arriba para que el primer bit recibido quede como el menos significativo, y pasar al siguiente estado tras ocho bits.

```vhdl
when data =>
  if (baud_rate = '1') then
    if s_reg = bit_stop-1 then          -- 32 ticks: centro del bit siguiente
      s_next <= (others => '0');
      b_next <= rx & b_reg(7 downto 1); -- desplaza la muestra, LSB primero
      if n_reg = (nbits - 1) then
        state_next <= stop;
      else
        n_next <= n_reg + 1;
      end if;
    else
      s_next <= s_reg + 1;
    end if;
  end if;
```

## La versión con antirrebote

Para probar la UART a mano, la lectura y la escritura se activan con pulsadores. Un pulsador mecánico rebota durante unos milisegundos al presionarlo, lo que la FPGA vería como decenas de pulsaciones. Un circuito antirrebote, otra máquina de estados (`zero → wait1 → one → wait0`), solo acepta un nuevo nivel cuando la entrada se ha mantenido estable durante 2²² ciclos de reloj, unos 34 ms a 125 MHz, y emite un pulso de un solo ciclo por pulsación: un toque, un byte leído o escrito.

En la tarjeta, un botón reinicia el diseño y otros dos leen y escriben; el byte que se envía entra por un conector Pmod, el byte recibido se muestra en los LEDs y en un segundo Pmod, y las líneas serie y las banderas de la FIFO salen por un tercero.

<figure>
  <img src="{{ '/assets/images/projects/uart/rtl-debounced.png' | relative_url }}" alt="Esquema RTL: dos circuitos antirrebote, uno para el botón de lectura y otro para el de escritura, conectados a las entradas de lectura y escritura del módulo UART." loading="lazy">
  <figcaption><b>Fig. 3</b>El nivel superior con antirrebote: cada botón pasa por su propio circuito antirrebote antes de llegar a la UART.</figcaption>
</figure>

## Verificación

Cada versión incluye *testbenches* en VHDL que ejercitan el diseño en simulación. El filtro antirrebote usa un contador de 12 bits en simulación, para que una pulsación se estabilice en unos pocos miles de ciclos, y uno de 22 bits para la síntesis. La asignación de pines para la Zybo Z7 está en los archivos de restricciones de Xilinx (XDC).

## Lo que me llevo

Una UART es una pequeña lección de muestreo. Sin un reloj compartido, el receptor reconstruye la temporización del transmisor a partir de un flanco y un contador, y confía en el centro de cada bit, donde la señal está más lejos de sus transiciones. Las mismas preguntas, cuándo muestrear y cuánto error de temporización se puede absorber, vuelven en todas las escalas del procesamiento de señales.
