inherit ROOM;

void create()
{
        set("short", "酒店");
        set("long", @LONG
这里是一家独具特色的酒店，由于地处白驼山下，酒店可
以供应风味食品。许多中原来客都爱来尝尝鲜，所以酒店生意
兴隆。酒店还经营打散装酒的业务。
LONG);
        set("exits", ([
                "north" : __DIR__"xijie",
        ]));
        set("objects",([
                "/d/city/npc/xiaoer2" : 1,
        ]));
        set("resource/water", 1);
        setup();
        replace_program(ROOM);
}
