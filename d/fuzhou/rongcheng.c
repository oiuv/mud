// Room: /d/fuzhou/rongcheng.c
// Date: May 12.1998 by Java
inherit ROOM;

void create()
{
	set("short", "榕城驿");
	set("long", @LONG
榕城驿是全省最大的客店，生意非常兴隆。外地游客多
选择这里落脚，你可以在这里打听到本省的风土人情。店小
二里里外外忙得团团转，福州的方言你是实在听不顺耳。还
是上楼睡觉去。墙上挂着一个牌子(paizi)。
LONG );
	set("no_fight", 1);
	set("valid_startroom", 1);
        set("no_sleep_room", 1);

	set("item_desc", ([
		"paizi" : "楼上雅房，每夜五十两白银。\n",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer" : 1,
	]));
	set("exits", ([
	    "south" : __DIR__"dongdajie",
	    "north" : __DIR__"majiu",
	    "up"    : __DIR__"rongcheng2",
	]));
	setup();
	"/clone/board/kedian5_b"->foo();
}

int valid_leave(object me, string dir)
{
	if (! me->query_temp("rent_paid") && dir == "up")
	        return notify_fail("店小二一下挡在楼梯前，白眼一翻：怎麽着，想白住啊！\n");

	if (me->query_temp("rent_paid") && dir == "west")
	return notify_fail("店小二跑到门边拦住：客官已经付了银子，怎麽不住店就走了呢！
旁人还以为小店伺候不周呢！\n");

	return ::valid_leave(me, dir);
}
