#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "天香堂");
        set("long",@LONG
这里是黑木崖的第四大堂天香堂。大厅里宽畅明亮，厅中
设有一座，一中年妇人横眉座在当中。从南边出厅是一片波光
粼粼的池塘。
LONG);
        set("exits", ([
            	"north" : __DIR__"dating4",
            	"south" : __DIR__"chitang",
            	"west" : __DIR__"tingptw",
            	"east" : __DIR__"tingpte",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/sang" : 1,
                __DIR__"npc/dizi6" : 4,
        ]));       
        setup();
}

int valid_leave(object me, string dir)
{
        if (objectp(present("sang sanniang", environment(me)))
           && dir == "south"
           && me->query("family/family_name")
           && me->query("family/family_name") != "日月神教")
                return notify_fail(CYN "桑三娘将你拦住，说道：后面是圣姑"
                                   "的住所，他人不得入内。\n" NOR);

	if (objectp(present("sang sanniang", environment(me)))
           && (string)me->query("gender") != "女性"
           && dir == "south")
                return notify_fail(CYN "桑三娘将你拦住，说道：后面是圣姑"
                                   "的住所，你一个男人进去干嘛？\n" NOR);

	if (objectp(present("sang sanniang", environment(me)))
           && ! me->query("family/family_name"))
                message_vision(CYN "桑三娘看了$N" CYN "一眼，皱眉道：去拜"
                               "师可得规矩点，可别惹恼了圣姑。\n" NOR, me);

        return ::valid_leave(me, dir);
}
