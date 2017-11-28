inherit ROOM;

void create()
{
        set("short", "练功房");
        set("long", @LONG
这里是白驼山弟子的练功房。里面有几个单间，是练功室。
第子们在里边砌磋武艺，绝对不允许外人打搅。
LONG);
        set("exits",([
                "west" : __DIR__"liangong",
        ]));

        set("objects",([
                __DIR__"npc/trainer" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
