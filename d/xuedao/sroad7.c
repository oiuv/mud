#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "大雪山口");
        set("long", @LONG
群山环绕，四周积雪终年不化。南边不远处有一个山谷。
LONG);
        set("exits", ([
                "north"     : __DIR__"sroad6",
                "southdown" : __DIR__"sroad8",
        ]));
        set("objects", ([
                __DIR__"npc/caiyaoren": 1,
        ]));
        set("outdoors", "xuedao");
        setup();
}

int valid_leave(object me, string dir)
{
        if (! playerp(me))
                return ::valid_leave(me, dir);

        if (dir == "southup")
        {
                message_vision(HIW "\n突然间只听得轰隆一声巨响，$N" HIW
                               "脚下踏了个空，竟然是雪崩了！\n" NOR, me);

                if (me->query_dex() / 2 + random(me->query_dex()) < 13)
                {
                        me->receive_damage("qi", 70);
                        me->receive_wound("qi", 70);
                }

                tell_object(me, HIW "只见大片的积雪从山峰上奔腾而下，铺"
                                "天盖地扑来，沿途并夹\n带了不少岩石。赶"
                                "紧逃命吧！\n\n" NOR);

                if (me->query_dex() / 2 + random(me->query_dex()) >= 15)
                {
                        me->move(__DIR__"sroad8");
                        return -1;
                } else 
                {
                        me->move(__DIR__"sroad5");
                        return -1;
                }
        }
        return ::valid_leave(me,dir);
}

