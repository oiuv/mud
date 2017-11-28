inherit ROOM;

void create()
{
        set("short",  "东门" );
        set("long", @LONG
这里便是昆明的东城门，来来往往各色人出出进进，有游
客，有做买卖的，也不乏些江湖人士。西边可以看见碧鸡枋。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "west" : __DIR__"bijifang", 
                "east"  :__DIR__"qingshilu2",
        ]));
        set("objects", ([
                "/d/beijing/npc/ducha" : 1,
                "/d/city/npc/bing" : 4,
        ]));
        setup();
        replace_program(ROOM);
}