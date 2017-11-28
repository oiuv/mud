#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "开封府");
        set("long", @LONG
开封府统管开封这片区域。现任的开封府尹包拯包大人铁
面无私。明断秋毫，深得民众信任，被称为包青天。大门一边
一个高大的鼓架告状鸣冤的可以在此敲鼓。
LONG);
        set("objects", ([
                __DIR__"npc/zhaohu" : 1,
                __DIR__"npc/zhanglong" : 1,
        ]));
        set("no_clean_up", 0);
        set("exits", ([
                "east" : __DIR__"jiedao1",
                "west" : __DIR__"datang",
        ]));
        set("outdoors", "kaifeng");

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;

        if (dir == "west")
        {
                if (objectp(ob = present("zhang long", this_object()))
                   && living(ob))
                        return notify_fail(CYN "张龙一把拦住你，喝道：衙门重"
                                           "地，怎由闲杂人等随便进出。\n" NOR);

                if (objectp(ob = present("zhao hu", this_object()))
                   && living(ob))
                        return notify_fail(CYN "赵虎一把拦住你，喝道：衙门重"
                                           "地，怎由闲杂人等随便进出。\n" NOR);
        }
        return ::valid_leave(me, dir);
}

