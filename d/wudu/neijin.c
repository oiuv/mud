inherit ROOM;

void create()
{
        set("short", "客房");
        set("long", @LONG
这里是一间客房，靠墙布着一溜通铺，行人累可以在这里随意休
息。窗边摆着一个破破烂烂的木桌，一个游方道人正坐在这里的桌边
上喝茶。
LONG);

        set("exits", ([
                "east" : __DIR__"xiaodian",
        ]));
        set("objects", ([
               CLASS_D("wudu") + "/daoshi" : 1,
        ]));

        setup();
        //replace_program(ROOM);
}
