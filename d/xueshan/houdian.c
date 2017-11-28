inherit ROOM;

void create()
{
        set("short", "后殿");
        set("long", @LONG
这里是大轮寺的后殿，也是雪山弟子闭门练功的地方。殿
内是一些练功的蒲团和木人，还有一些吊挂着的沙袋和直竖的
木桩。
LONG);

        set("exits", ([
                "north" : __DIR__"chanshi",
                "south" : __DIR__"neidian",
        ]));

        setup();
        replace_program(ROOM);
}
