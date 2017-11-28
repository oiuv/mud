inherit ROOM;

void create()
{
        set("short", "赛马场");
        set("long", @LONG
这里是小镇的赛马场。场上正在举行维吾尔族的姑娘追表
演。一个小伙子可以找一个姑娘并骑慢驰到一处折返点。去的
路上小伙子可以对姑娘随便挑逗。回来时姑娘则可以用鞭子抽
打小伙子。当然如果姑娘喜欢这个小伙子，落鞭就会轻些。否
则的话，有小伙子好受的。
LONG);
        set("exits", ([ 
                "southeast" : __DIR__"beijiang",
        ]));

        set("objects", ([
                __DIR__"npc/alamuhan" : 1,
        ]));

        set("outdoors", "xiyu");

        setup();
        replace_program(ROOM);
}
