#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIY "【天庭】" NOR);
        set("long", HIY @LONG
                    天           庭

    这里一天庭所在，天庭正中央正坐着天帝高处不胜寒，不怒自威，
你的腿脚不禁都有些软了。

LONG NOR );

        set("no_sleep_room", 1);
        set("objects", ([
                __DIR__"npc/lonely": 1,
        ]));

        setup();
}


