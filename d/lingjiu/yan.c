inherit ROOM;

void create()
{
  	set("short", "失足岩");
  	set("long", @LONG
这是通向灵鹫宫的必经之路，山道被一块如鹰喙突出的巨
岩截断，巨岩光可鉴人，只有中间凿出了一条窄窄的石阶通向
山道的那一头。你小心翼翼地试着踏了上去。失足岩的右侧是
一块大平台，依稀看去好象有不少人在那里聚会。
LONG );
        set("outdoors", "lingjiu");
        set("exits",([
                "northup"  : __DIR__"jian",
                "eastdown" : __DIR__"ya",
                "east" : __DIR__"shandao",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/zhuo" : 1,
                "/clone/npc/walker" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
