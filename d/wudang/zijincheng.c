inherit ROOM;

void create()
{
        set("short", "紫金城");
        set("long", @LONG
这是守护金殿的紫金城墙，周长三里，城墙由花岗石依山
势砌成，东西北城门均面临绝壁，南门为上下路口，气势壮观。
LONG);
        set("exits", ([
                "north" : __DIR__"jinding",
                "south" : __DIR__"jindian",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
