/* File    : tcp.c.c
 * Creator : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This file is used to let other muds know what tcp services we support.
 */

inherit F_CLEAN_UP;

/* The tcp file is used to allow other muds to find out which tcp services
 * are supported.
 */

int support_tcp_mail()      { return 1; }

int support_tcp_tell()      { return 1; }

int support_tcp_finger()    { return 1; }

int support_tcp_interwiz()  { return 1; }
