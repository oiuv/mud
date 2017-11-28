
inherit ROOM;

void create()
{
        set("short", "重阳宫大门");
        set("long", @LONG
你已走到了终南山半山腰，前面就是全真教的总部重阳宫
了。殿宇依山而筑，高低错落有致。但见周围古木森森，翠竹
成林，景色清幽。前方黄墙碧瓦，飞檐翘檩，正中一道三丈来
高的朱红杉木包铜大门(door)。上方一块大匾，龙飞凤舞地书
着『重阳宫』三个大字。南下是广场。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "southdown"   : __DIR__"daxiaochang",
        ]));

        setup();
        replace_program(ROOM);
}
