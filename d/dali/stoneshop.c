//Room: /d/dali/stoneshop.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","石铺");
	set("long",@LONG
大理地段有一山石以其天然的花纹而闻名天下，那便是大名鼎鼎
的大理石。用大理石中的水墨花石制作的画屏，其奇妙程度，使人叹
而观止。唐宋时代，许多官商将儒都好以大理石作家居摆设。石铺里
人头济济，敲打钻磨之声不绝于耳。一个白族老头光着膀子，来回踱
着小步，指导着新伙计。
LONG);
	set("objects", ([
	   __DIR__"npc/shijiang": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "west"  : __DIR__"taiheeast",
	]));
	setup();
	replace_program(ROOM);
}

