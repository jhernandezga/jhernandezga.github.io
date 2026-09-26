---
title: "A UART interface in VHDL for the Zybo Z7"
description: "A serial transmitter and receiver described in VHDL, with a baud-rate generator, FIFO buffers and debounced buttons, for a Zynq-7000 FPGA board."
lang: en
date: 2021-12-30
permalink: /projects/uart-vhdl/
translation: /es/proyectos/uart-vhdl/
tags: [VHDL, FPGA, Digital design, Serial communication]
published: true
repository: "https://github.com/jhernandezga/UART-interface"
---

A UART (universal asynchronous receiver-transmitter) described module by module in VHDL at the end of 2021, and constrained for the Digilent Zybo Z7, a board built around a Zynq-7000 FPGA. The work lives in two repositories: the [UART core](https://github.com/jhernandezga/UART-interface), and a [version with debounced push buttons](https://github.com/jhernandezga/UART-DEBOUNCED-interface) for testing it by hand on the board.

## What a UART does

A UART sends bytes one bit at a time over a single wire, with no shared clock. Transmitter and receiver only agree beforehand on the bit rate. Each byte travels in a frame: the idle line is high; a **start bit** pulls it low, eight **data bits** follow, least significant first, and a **stop bit** returns it high (the 8N1 format).

The receiver has to rebuild the transmitter's timing from that falling edge alone. It counts ticks of a local clock that runs 32 times faster than the bit rate: 16 ticks after the edge it is in the middle of the start bit, and from there every 32 ticks lands in the middle of the next bit, where the signal is most stable.

{% include diagrams/uart-frame.html lang='en' caption='<b>Fig. 1</b>One frame on the line, carrying the byte 0x4A. The receiver samples each bit in its middle (blue dots), counting ticks from the falling edge of the start bit.' %}

## Architecture

The design is split into five modules, all parameterised with generics (data bits, stop-bit length, clock divisor, FIFO depth):

- **Baud-rate generator.** A counter that wraps every `M` clock cycles and emits a one-cycle tick. For 32 ticks per bit at 9600 baud from the board's 125 MHz clock:

  ```
  M = f_clk / (32 · baud) = 125 MHz / (32 × 9600) ≈ 407
  ```

  which gives 9597 baud, 0.03 % off the nominal rate, well within what a UART tolerates.

- **Receiver.** A state machine (`idle → start → data → stop`) that waits for the falling edge, counts 16 ticks to the middle of the start bit, then 32 ticks per bit, shifting each sample into a register. It raises `rx_done_tick` for one cycle when the stop bit ends.
- **Transmitter.** The mirror image: it holds the line high, sends the start bit, shifts out the eight data bits and the stop bit, and raises `tx_done_tick` when the frame is complete.
- **Two FIFO buffers.** Circular buffers of 16 bytes with read and write pointers and `full` / `empty` flags. The receive FIFO stores incoming bytes until the user reads them; the transmit FIFO queues outgoing bytes, and the transmitter starts whenever it is not empty.

<figure>
  <img src="{{ '/assets/images/projects/uart/rtl-uart.png' | relative_url }}" alt="RTL schematic: a baud-rate generator feeding a receiver and a transmitter; the receiver writes into a receive FIFO and the transmitter reads from a transmit FIFO." loading="lazy">
  <figcaption><b>Fig. 2</b>RTL schematic of the UART core in Vivado: baud-rate generator, receiver and transmitter, each with its FIFO.</figcaption>
</figure>

The heart of the receiver is the data state: wait for a full bit period, take the sample, shift it in from the top so that the first bit received ends up as the least significant one, and move on after eight bits.

```vhdl
when data =>
  if (baud_rate = '1') then
    if s_reg = bit_stop-1 then          -- 32 ticks: middle of the next bit
      s_next <= (others => '0');
      b_next <= rx & b_reg(7 downto 1); -- shift the sample in, LSB first
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

## The debounced version

To test the UART by hand, reading and writing are triggered by push buttons. A mechanical button bounces for a few milliseconds when pressed, which the FPGA would see as dozens of presses. A debounce circuit, another state machine (`zero → wait1 → one → wait0`), only accepts a new level once the input has stayed stable for 2²² clock cycles, about 34 ms at 125 MHz, and emits a single-cycle pulse on each press: one push, one byte read or written.

On the board, one button resets the design and two others read and write; the byte to send comes in through a Pmod connector, the received byte is shown on the LEDs and a second Pmod, and the serial lines and FIFO flags go out through a third.

<figure>
  <img src="{{ '/assets/images/projects/uart/rtl-debounced.png' | relative_url }}" alt="RTL schematic: two debounce circuits, one for the read button and one for the write button, feeding the read and write inputs of the UART module." loading="lazy">
  <figcaption><b>Fig. 3</b>The debounced top level: each button passes through its own debounce circuit before reaching the UART.</figcaption>
</figure>

## Verification

Each version comes with VHDL testbenches that drive the design in simulation. The debounce filter uses a 12-bit counter in simulation, so that a press settles in a few thousand cycles, and a 22-bit counter for synthesis. The pin assignments for the Zybo Z7 are in the Xilinx constraints (XDC) files.

## What I take from it

A UART is a small lesson in sampling. With no shared clock, the receiver reconstructs the transmitter's timing from one edge and a counter, and trusts the middle of each bit, where the signal is furthest from its transitions. The same questions, when to sample and how much error the timing can absorb, come back at every scale of signal processing.
