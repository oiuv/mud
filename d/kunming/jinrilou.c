inherit ROOM;

void create()
{
        set("short",  "近日古楼" );
        set("long", @LONG
近日楼地处昆明市中心，南来北往的人都从这里通过，二
楼悬有一巨钟，北边是平西王府，一般人很少去那里，西边是
金马枋，南边热闹非凡，熙熙攘攘，人来人往。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "west" : __DIR__"jinmafang", 
                "east"  :__DIR__"bijifang",
                "south" :__DIR__"nandajie1",
                "north" :__DIR__"beidajie",
                "up"    :__DIR__"zhonglou",                           
        ]));

        set("objects", ([
                "/clone/npc/xunbu" : 1,
                "/d/beijing/npc/richman1" : 1,
        ]));                       
        setup();
        replace_program(ROOM);
}
