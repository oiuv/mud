
inherit ROOM;

void create()
{
        set("short", "小屋");
        set("long", @LONG
你走进了一间小屋，房间很小，除了一张小床放不下别的
东西了。床上好象有几件叠得整整齐齐的粗布衫，洗的干干净
净。
LONG
        );

        set("exits", ([
                "northwest" : __DIR__"xiuxishi",
                "east" : __DIR__"xiaoting",
        ]));

        set("objects", ([
                __DIR__"obj/fengmi" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
