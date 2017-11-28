// yaodian.c
// Date: Nov.1997 by Venus

#include <room.h>
inherit ROOM;
void create()
{
        set("short", "胡庆余堂");
        set("long", @LONG
这是一家明净宽敞的药堂，後墙上是一个大药柜。几个伙计正忙
着爬上爬下地从小抽屉里抓药。药柜前摆着一张桌子，桌旁一位老者
正在为人把脉。他就是名医胡庆余。
    柜台上方高挂一个大牌子(paizi).
LONG);
        set("exits", ([
            "west"      : __DIR__"road14",
        ]));
        set("no_fight","1");
        set("no_beg","1");
        set("objects", ([
            __DIR__"npc/huqingyu" : 1,
        ]));
        set("item_desc", ([
            "paizi" : "本店出售各类药品。\n"
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
