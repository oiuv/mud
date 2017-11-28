inherit ROOM;

void create()
{
        set("short",  "南大街" );
        set("long", @LONG
你走在昆明最繁华的街道上，人来人往，好不热闹，西边
有一家客店，人们大多选择这里落脚，以便在赶路。东边听里
面传来的谈笑声看，肯定是一家茶铺。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south" : __DIR__"nanmen", 
                "north" : __DIR__"nandajie1",
                "west"  : __DIR__"kedian",
                "east"  : __DIR__"chapu",
        ]));
        set("objects", ([
                "/d/beijing/npc/girl2" : 1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
