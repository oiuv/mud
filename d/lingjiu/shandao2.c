inherit ROOM;

void create()
{
  	set("short", "平台山道");
  	set("long", @LONG
山道被一块如鹰喙突出的巨岩截断，巨岩光可鉴人，只有
中间凿出了一条窄窄的石阶通向山道的那一头。你小心翼翼地
试着踏了上去。右侧是一块大平台，依稀看去好象有不少人在
那里聚会。
LONG);
        set("outdoors", "lingjiu");
        set("exits", ([
                "south" : __DIR__"shandao",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/zuo" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
