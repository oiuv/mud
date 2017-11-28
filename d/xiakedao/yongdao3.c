// /d/xiakedao/yongdao3.c 侠客岛 甬道3

inherit ROOM;

void create()
{
        set("short", "甬道");
        set("long", @LONG
这里往来者甚多，多数是急匆匆武林人物，亦有不少青衣弟子。
许多人都手持食物边走边吃，惟恐耽误了时间。几个衣衫褴褛的乞丐
便在墙边鼾然入睡。一个小僮踮起脚尖，正在添加灯油。
LONG );
        set("exits", ([
                "south" : __DIR__"shimen",
                "north" : __DIR__"dating",
        ]));
        set("objects", ([
                __DIR__"npc/tongzi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
