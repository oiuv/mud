inherit ROOM;

void create()
{
        set("short", "杂货铺");
        set("long", @LONG
这是一个小小的杂货铺。房屋内铺着地毯。店老板坐在地
毯上，旁边堆着他的货。墙上有个牌子是个价目。
LONG);
        set("exits", ([ 
                "east" : __DIR__"beijiang",
        ]));
        set("objects", ([
                __DIR__"npc/maimaiti": 1
        ]) );
        setup();
        replace_program(ROOM);
}

 
