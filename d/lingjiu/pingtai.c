inherit ROOM;

void create()
{
  	set("short", "山间平台");
  	set("long", @LONG
这是失足岩左侧的一块大平台，平台周围聚满了人。左边
通向灵鹫宫的必经之路，山道被一块鹰喙突出的巨岩截断，巨
岩光可鉴人，只有中间一条窄窄的石阶通向山道的那一头。
LONG);
        set("outdoors", "lingjiu");
        set("exits",([
                "west" : __DIR__"shandao",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/li" : 1,
                CLASS_D("lingjiu") + "/sang" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
