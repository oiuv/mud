inherit ROOM;

void create()
{
        set("short", "南岭山口");
        set("long", @LONG
这里是南岭的一个山口。南面就是佛山了，北面是横亘湖
南广东的五岭。这里地气非常炎热，百物速生快长，口音也渐
渐远异中原了。
LONG);
        set("outdoors", "foshan");
        set("exits", ([
                "northup" : "/d/henshan/hsroad9",
                "south"   : __DIR__"northgate",
        ]));
        setup();
        replace_program(ROOM);
}
