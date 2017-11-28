inherit ROOM;

void create()
{
        set("short",  "小西门" );
        set("long", @LONG
这里是昆明的西城门，俗称小西门，来来往往各色人出出
进进，有游客，有做买卖的，也不乏些江湖人士。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "west" : __DIR__"xroad1",
                "east" : __DIR__"jinmafang",
        ]));
        set("objects", ([
                "/d/beijing/npc/ducha" : 1,
                "/d/beijing/npc/caifan" : 1,
                "/d/city/npc/bing" : 4,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
