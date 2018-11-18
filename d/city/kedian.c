#include <room.h>
#include <ansi.h>

inherit CREATE_CHAT_ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", "客店");
	set("long", @LONG
这是一家价钱低廉的客栈，生意却是非常兴隆。外地游客
多选择这里落脚，你可以在这里打听到各地的风土人情。店小
二里里外外忙得团团转，接待着南腔北调的客人。客店的主人
从不露面，他究竟是谁，有各种各样的猜测。客店的西墙上挂
着一个牌子(paizi)。
LONG );
	set("no_fight", 1);
	set("valid_startroom", 1);
        set("no_sleep_room",1);
	set("item_desc", ([
		"paizi" : WHT "\n\n        ※※※※※※※※※※※※※※※※※\n"
                              "        ※                              ※\n"
                              "        ※    " NOR + HIW "楼上雅房，每夜十两白银。" NOR + WHT "  ※\n"
                              "        ※                              ※\n"
                              "        ※※※※※※※※※※※※※※※※※\n\n\n" NOR,
	]));
	set("objects", ([
		__DIR__"npc/xiaoer" : 1,
	]));
	set("exits", ([
		"west" : __DIR__"beidajie1",
		"up"   : __DIR__"kedian2",
		"south": __DIR__"liaotian",
	]));


	setup();
	"/clone/board/kedian_b"->foo();
  "/adm/npc/beichou"->come_here();
}

void init()
{
        add_all_action();
}

int valid_leave(object me, string dir)
{

	if (! me->query_temp("rent_paid") && dir == "up")
	        return notify_fail(CYN "店小二一下挡在楼梯前，白眼一翻：怎麽着，想白住啊？\n" NOR);

	if (me->query_temp("rent_paid") && dir == "west")
	        return notify_fail(CYN "店小二跑到门边拦住：客官已经付了银子，怎麽不住店就走了呢！\n" NOR);

	return ::valid_leave(me, dir);
}
