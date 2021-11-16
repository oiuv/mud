// File    :  /include/ansi.h
// Creator :  Gothic@TMI-2 雪风@mud.ren
// https://en.wikipedia.org/wiki/ANSI_escape_code
// The standard set of ANSI codes for mudlib use.

#ifndef ANSI_H
#define ANSI_H

// Control Characters
#define BEEP "\07" /* Beep Sound BEL(\a) */
#define ESC "\033" /* Escape ESC(\e | \x1b) */
// Escape Sequences
#define CSI ESC + "[" /* Control Sequence Introducer */
// CSI Color Sequences
#define SGR(x) CSI + x + "m"                                      /* ANSI color code (Select Graphic Rendition) */
#define FCC(x) CSI + "38;5;" + x + "m"                            /* Foreground 256 color code */
#define BCC(x) CSI + "48;5;" + x + "m"                            /* Background 256 color code */
#define RGB(r, g, b) CSI + "38;2;" + r + ";" + g + ";" + b + "m"  /* Foreground 24 bit rgb color code */
#define BRGB(r, g, b) CSI + "48;2;" + r + ";" + g + ";" + b + "m" /* Background 24 bit rgb color code */

/* Foreground Colors 30 ~ 37 */

#define BLK SGR("30")  /* 黑 */
#define RED SGR("31")  /* 紅 */
#define GRN SGR("32")  /* 綠 */
#define YEL SGR("33")  /* 黃 */
#define BLU SGR("34")  /* 藍 */
#define MAG SGR("35")  /* 紫 */
#define CYN SGR("36")  /* 青 */
#define WHT SGR("37")  /* 白 */
#define FNOR SGR("39") /* 默认前景色 */

/* Hi Intensity Foreground Colors 90 ~ 97 */

#define HIK SGR("1;30") /* 灰 */
#define HIR SGR("1;31") /* 紅 */
#define HIG SGR("1;32") /* 綠 */
#define HIY SGR("1;33") /* 黃 */
#define HIB SGR("1;34") /* 藍 */
#define HIM SGR("1;35") /* 紫 */
#define HIC SGR("1;36") /* 青 */
#define HIW SGR("1;37") /* 白 */

/* Background Colors 40 ~ 47 */

#define BBLK SGR("40") /* 黑 */
#define BRED SGR("41") /* 紅 */
#define BGRN SGR("42") /* 綠 */
#define BYEL SGR("43") /* 黃 */
#define BBLU SGR("44") /* 藍 */
#define BMAG SGR("45") /* 紫 */
#define BCYN SGR("46") /* 青 */
#define BWHT SGR("47") /* 白 */
#define BNOR SGR("49") /* 默认背景色 */

/* High Intensity Background Colors 100 ~ 107 */

#define HBBLK SGR("1;40") /* 灰 */
#define HBRED SGR("1;41") /* 紅 */
#define HBGRN SGR("1;42") /* 綠 */
#define HBYEL SGR("1;43") /* 黃 */
#define HBBLU SGR("1;44") /* 藍 */
#define HBMAG SGR("1;45") /* 紫 */
#define HBCYN SGR("1;46") /* 青 */
#define HBWHT SGR("1;47") /* 白 */

// #define NOR ESC + "[m"   /* Puts everything back to normal */
#define NOR SGR("0")     /* 清除所有特殊属性 */
#define BOLD SGR("1")    /* Turn on BOLD mode */
#define ITALIC SGR("3")  /* Turn on ITALIC mode */
#define U SGR("4")       /* Initialize underscore mode */
#define BLINK SGR("5")   /* Initialize blink mode */
#define REV SGR("7")     /* Turns reverse video mode on */
#define HIREV SGR("1;7") /* Hi intensity reverse video  */
#define HIDDEN SGR("8")  /* 消隐(部分客户端不支持) */
#define STRIKE SGR("9")  /* Display text as strikethrough */
#define BOFF SGR("21")   /* BOLD OFF */
#define IOFF SGR("23")   /* ITALIC OFF */
#define UOFF SGR("24")   /* UNDERLINE OFF */
#define ROFF SGR("27")   /* Reverse OFF */

/* Additional ansi Esc codes added to ansi.h by Gothic  april 23,1993 */
/* Note, these are Esc codes for VT100 terminals, and emmulators */
/*          and they may not all work within the mud             */
#define CUU(n) CSI + n + "A"                 /* （Cursor Up）光标向上移动n（默认1）格。如果光标已在屏幕边缘，则无效 */
#define CUD(n) CSI + n + "B"                 /* （Cursor Down）光标向下移动n（默认1）格。如果光标已在屏幕边缘，则无效 */
#define CUF(n) CSI + n + "C"                 /* （Cursor Forward）光标向右移动n（默认1）格。如果光标已在屏幕边缘，则无效 */
#define CUB(n) CSI + n + "D"                 /* （Cursor Back）光标向左移动n（默认1）格。如果光标已在屏幕边缘，则无效 */
#define CNL(n) CSI + n + "E"                 /* （Cursor Next Line）光标移动到下面第n（默认1）行的开头 */
#define CPL(n) CSI + n + "F"                 /* （Cursor Previous Line）光标移动到上面第n（默认1）行的开头 */
#define CHA(n) CSI + n + "G"                 /* （Cursor Horizontal Absolute）光标水平移动到第n（默认1）列 */
#define CUP(x, y) CSI + x + ";" + y + "H"    /* 將 cursor 移至第 x 行第 y 列（Cursor Position） */
#define HOME CSI "H"                         /* Send cursor to home position */
#define CLR CSI "2J"                         /* Clear the screen  */
#define ECL CSI "2K"                         /* Erase entire line. Cursor position does not change. */
#define REF CLR + HOME                       /* Clear screen and home cursor */
#define SPU(n) CSI + n + "S"                 /* Scroll whole page up by n (default 1) lines. */
#define SPD(n) CSI + n + "T"                 /* Scroll whole page down by n (default 1) lines. */
#define FREEZE(x, y) CSI + x + ";" + y + "r" /* Freeze 住從 x 到 y 這幾行作為 screen */
#define FRTOP CSI "2;25r"                    /* Freeze top line */
#define FRBOT CSI "1;24r"                    /* Freeze bottom line */
#define UNFR CSI "r"                         /* Unfreeze top and bottom lines */
#define SAVEC CSI "s"                        /* Save cursor position */
#define RESTC CSI "u"                        /* Restore cursor to saved position */

#define REVINDEX ESC + "M" /* Scroll screen in opposite direction */
#define BIGTOP ESC + "#3"  /* Dbl height characters, top half */
#define BIGBOT ESC + "#4"  /* Dbl height characters, bottem half */
#define SINGW ESC + "#5"   /* Normal, single-width characters */
#define DBL ESC + "#6"     /* Creates double-width characters */
#define DECALN ESC + "#8"  /* DEC 屏幕校准测试 - 以E填充屏幕 */

#endif
