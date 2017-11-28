//Room: /d/dali/hebian.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","河边");
	set("long",@LONG
你来到河边，两侧山壁几乎是直上直下，西面是一条大河自北滚
滚而来，在此折向东奔腾而去，河水汹涌，巨浪滔天，发出一阵阵骇
人的轰响。此处河谷稍窄，前面有三根粗藤条绑在一棵大树上，另一
端跨河而过，似可攀援而过。此去向南乃是崇山峻岭。
LONG);
	set("objects", ([
	   __DIR__"npc/wshangfan": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "south"     : __DIR__"shanlin",
	    "east"      : __DIR__"heshang",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

