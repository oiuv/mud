inherit ROOM;

void create()
{
  	set("short", "山间平台");
  	set("long", @LONG
这是失足岩左侧的一块大平台，平台周围聚满了人。左边
通向灵鹫宫的必经之路，山道被一块鹰喙突出的巨岩截断，巨
岩光可鉴人，只有中间一条窄窄的石阶通向山道的那一头。你
身后不远处堆着几丛稻草，有几个武林人士正躺在上面呼呼大
睡。你看了也不禁想走过去休息一会儿。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("outdoors", "lingjiu");
        set("exits",([
                "north" : __DIR__"shandao",
        ]));

        setup();
        replace_program(ROOM);
}
