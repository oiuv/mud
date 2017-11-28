#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", WHT "第二指节" NOR );
        set("long", @LONG
这里已到了中指峰的半山腰了，由于铁掌山排列得象手指一样，每座山
峰又再分为三截，就如手指的指节一般，因此这里又正是位于第二指节的位
置。这里离峰顶已近，透过淡淡的云雾，似已可以看到山路的尽头了。左前
方二十于丈处，黑黝黝的似有一个洞穴(dong)，洞口砌以玉石，修建得极是
齐整。
LONG    );
        set("exits", ([
                "south" : __DIR__"sslin-5",
                "northup" : __DIR__"shanlu-8",
                "enter" : __DIR__"dong-1",
]));
        set("objects", ([
                __DIR__"npc/mayi" : 2,
]));

        set("item_desc", ([ 
                "dong" : WHT "一个黑黝黝的山洞。黑暗中偶尔有几点磷光闪过。\n" NOR,
]));
        set("no_clean_up", 0);
        set("outdoors", "tiezhang");
        setup();
}

int valid_leave(object me, string dir)
{        
        if (dir == "enter" && objectp(present("mayi zhanglao", environment(me))))
           return notify_fail(CYN "麻衣长老喝道：此乃铁掌帮禁地，任何人不得入内，否则有死无生！\n" NOR);
                
        return ::valid_leave(me, dir);
}
