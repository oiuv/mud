inherit ROOM;

void create()
{
        set("short", "大雄殿");
        set("long", @LONG
这里是报国寺大雄殿。报国寺是峨嵋山最大寺院之一。大
雄殿内供着金光灿灿的佛像，气宇轩昂。
LONG);
        set("objects", ([
                __DIR__"npc/guest" : 2,
        ]));

        set("exits", ([
                "out"   : __DIR__"bgs",
                "west"  : __DIR__"bgschanfang",
                "north" : __DIR__"cangjinglou",
        ]));
        setup();
        replace_program(ROOM);
}
