#include <ansi.h>;
inherit ROOM;

void create()
{
        set("short", "山洞");
        set("long", @LONG
在这小山洞的深处，一股强大的水流自地上流出，形成一
条小河流向洞外。如果想再进一步深入的话，就得要跳入水中
了。往外可到小河边。往里就要潜水了。
LONG
        );
        set("outdoors", "quanzhen");
        set("item_desc", ([
                "dong" : NOR + BLU"\n一个深邃、幽暗、恐怖的小山洞。\n" NOR,
        ]));
        set("exits", ([
                "out"      : __DIR__"xiaohebian",
                "westdown" : __DIR__"mishi7",
        ]));

        setup();
}
int valid_leave(object me, string dir)
{
//	object obj;
	if (dir == "westdown" && me->query("family/family_name") != "古墓派")
	{
		return notify_fail("这么急的水，你想跳下去自杀呀？\n");
	}
	if (dir == "westdown" && me->query("family/family_name")=="古墓派")
	{
                message_sort(HIG "\n$N" HIG " 纵身一跃，跳入水摊之中，许多游"
                             "鱼从你身边游过，你伸手一捞，却抓了空。突然$N" HIG 
                             "眼前一亮，一股暗流扑面而来，将$N" HIG "冲入一个"
                             "所在。\n"NOR, me);

		return 1;
	}
        return ::valid_leave(me, dir);
}