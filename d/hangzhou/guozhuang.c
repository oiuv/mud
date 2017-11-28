inherit ROOM;

void create()
{
        set("short", "郭庄");
        set("long", @LONG
庄园的大匾上是「郭庄」两个大字。朱红色的大门紧紧关
闭着，里面静悄悄的一点声音都没有。
LONG);
        set("exits", ([
                "east" : __DIR__"dadao1",
        ]));
        set("objects", ([
                "/clone/quarry/gou2" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
