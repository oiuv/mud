// Room: /u/zqb/tiezhang/hhyang-2.c
#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", HIR "花圃" NOR);
	set("long", @LONG
只见这里摆满了茉莉、素馨、麝香藤、朱槿、玉桂、红蕉，都是夏日盛
开的香花。院墙上又挂了枷木兰、真腊龙诞等香珠，但觉馨意袭人，清芬满
园。园中桌上放着几盆新藕、甜瓜、枇杷、等鲜果，椅子上丢着把蒲扇，看
来是帮主休息的地方。
LONG	);
	set("exits", ([ /* sizeof() == 1 */
  "west" : __DIR__"hhyuan-1",
]));
	set("no_clean_up", 0);
    set("outdoors", "tiezhang");

	setup();
	replace_program(ROOM);
}
