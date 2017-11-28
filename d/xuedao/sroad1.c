inherit ROOM;

void create()
{
        set("short","山路");
        set("long",@LONG
川西多是崇山峻岭，交通不便。一条山路蜿蜒在山间，连
接着藏边和中原。
LONG);
        set("exits",([
                "north" : "/d/city3/nanheqiaos",
                "west"  : __DIR__"sroad2",
                "northwest" : "/d/lingxiao/boot",
        ]));
        set("outdoors", "xueshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

