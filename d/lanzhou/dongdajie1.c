inherit ROOM;
void create()
{
        set("short", "东大街");
        set("long", @LONG
你走在兰州城的东大街上，由于兰州是西北地区的交通要
道，不论到西域还是中原都要经过这里，所以各地的行人来来
往往，你不时还可以看见一些来自西域的商人带着驼队匆匆向
东走去。西边就是兰州城的中央广场，这儿远离了中央广场的
宣闹，南边有一座土地庙。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "north" : __DIR__"caisicang",
                "west" : __DIR__"guangchang",
                "east" : __DIR__"dongmen",
        ]));
        set("objects", ([
                "/d/beijing/npc/girl1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
