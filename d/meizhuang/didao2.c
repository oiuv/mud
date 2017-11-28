// midao2.c

inherit ROOM;

void create()
{
        set("short", "梅庄密道");
        set("long", @LONG
这是一条昏暗潮湿的地道，地道很长，两边点着两根不太明亮的
火把，地道两旁的墙壁上画着很多不知道出自何人之手的壁画，而且
画得相当难看，你加快脚步，想知道地道的尽头是什么地方。 
LONG
        );
        set("exits", ([ /* sizeof() == 4 */
                "south" : __DIR__"didao1",
                "north" : __DIR__"didao3",
                "west" : __DIR__"didao2",
                "east" : __DIR__"didao1",
        ]));

        setup();
        replace_program(ROOM);
}

