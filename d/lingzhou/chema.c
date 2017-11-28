// Room: /lingzhou/chema.c
// Java Sep. 23 1998

inherit ROOM;

void create()
{
	set("short", "车马店");
	set("long", @LONG
一家低档的车马客栈，建筑相当陈旧，很不起眼，不过由于价钱低
廉，又是在北门的交通要道上，三教九流多选择这里落脚，生意也相当
不错，你也可以在这里打听到当地的风土人情。
    墙上挂着一个牌子(paizi)。
LONG );
	set("no_fight", 1);
        set("no_sleep_room",1);
//	set("no_clean_up", 0);
	set("item_desc", ([
		"paizi" : "楼上雅房，每夜十两白银。\n",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer" : 1,
	]));
	set("exits", ([
		"east" : __DIR__"majiu",
		"west" : __DIR__"nandajie",
		"up"   : __DIR__"chema2",
	]));
	setup();
}

int valid_leave(object me, string dir)
{

	if ( !me->query_temp("rent_paid") && dir == "up" )
	return notify_fail("店小二一下挡在楼梯前，白眼一翻：怎麽着，想白住啊！\n");

	if ( me->query_temp("rent_paid") && dir == "west" )
	return notify_fail("店小二跑到门边拦住：客官已经付了银子，怎麽不住店就走了呢！
旁人还以为小店伺候不周呢！\n");

	return ::valid_leave(me, dir);
}
