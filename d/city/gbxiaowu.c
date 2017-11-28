inherit ROOM;

void create()
{
        set("short", "破庙内部");
        set("long", @LONG
你走进了土地庙。四周墙壁都由青竹篾编成，窗外是一望
无际的竹林。屋里的桌椅、床铺均为竹制。但一阵扑鼻而来的
狗肉香味，却显得与这清雅的气纷格格不入。
LONG);
        set("exits", ([
                "out" : __DIR__"pomiao"
        ]));

	set("objects", ([
		CLASS_D("gaibang") + "/hong" : 1,
	]));

        set("valid_startroom", 1);
        set("sleep_room", 1);
        setup();
        replace_program(ROOM);
}

