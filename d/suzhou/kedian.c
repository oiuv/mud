// Room: /d/suzhou/kedian.c
// Date: May,31 1998 Java

inherit ROOM;

void create()
{
	set("short", "客店");
	set("long", @LONG
这是一家价钱低廉的客栈，生意非常兴隆。外地游客多选
择这里落脚，你可以在这里打听到各地的风土人情。店小二里
里外外忙得团团转，接待着南腔北调的客人。
    墙上挂着一个牌子(paizi)。
LONG );
	set("no_fight", 1);
	set("valid_startroom", 1);
        set("no_sleep_room",1);
	set("no_clean_up", 0);
	set("item_desc", ([
		"paizi" : "楼上雅房，每夜五十两白银。\n",
	]));
	set("objects", ([
	        "/d/city/npc/xiaoer2" : 1,
	]));
	set("exits", ([
		"west" : __DIR__"beidajie1",
		"east" : __DIR__"majiu",
		"up"   : __DIR__"kedian2",
	]));

	setup();
	"/clone/board/kedian4_b"->foo();
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
