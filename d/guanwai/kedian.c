//Room: /d/dali/kedian.c

inherit ROOM;
void create()
{
	set("short","客店");
	set("long",@LONG
这是城里唯一的一家小客栈，专门接待过往客商，生意非常兴隆。
店小二里里外外忙得团团转。此间虽偏远，却不因势坑宰客人，住店一
宿只要五两银子。
LONG);
	set("no_fight", 1);
	set("valid_startroom", 1);
        set("no_sleep_room",1);
	set("exits",([ /* sizeof() == 1 */
	    "west"    : __DIR__"majiu",
            "east"    : __DIR__"jishi",
	    "up"      : __DIR__"kedian2",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer" : 1,
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
