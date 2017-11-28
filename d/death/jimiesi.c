#include <ansi.h>
#include <room.h>
inherit ROOM;

void create()
{
        set("short", HIB "【寂灭司】" NOR);
        set("long", HIB @LONG

                    寂         灭         司

    寂灭司内寒气森森，青石铺设的地面满是灰尘。堂周青布围幔，围幔
上用金银丝线绣着些奇怪的图案，正堂上一张青石桌案 (table)，桌案上
布满了蛛网，看样子很久没打扫过了。

LONG NOR );

        set("item_desc", ([
                "table" : WHT "一个青石制成的桌案，上面有几许"
                          "裂缝，看样子已搁在这里很久了。\n" NOR,
        ]));

        set("exits", ([
                "east"  : __DIR__"lunhuisi_road1",
                "west"  : __DIR__"yanluodian",
                "north" : __DIR__"heisenlin/entry",
        ]));

        setup();
}

